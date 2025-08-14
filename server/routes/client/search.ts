import { Router } from "express";
import { db } from "../../db";
import { sql } from "drizzle-orm";

const router = Router();

// Client search endpoint - scoped to contact_id for security
router.get("/", async (req: any, res) => {
  try {
    const contactId = req.contact?.id || req.query.contactId;
    if (!contactId) {
      return res.status(401).json({ error: "Unauthorized - contactId required" });
    }

    const q = String(req.query.q || "").trim();
    const lang = process.env.SEARCH_DEFAULT_LANG || "english";
    const limit = Math.max(1, Math.min(Number(req.query.limit || 50), 200));
    
    const list: any[] = [];

    if (q) {
      // Search with query
      const tsquery = `plainto_tsquery('${lang}', $1)`;
      
      try {
        // Messages search
        const messagesQuery = sql`
          SELECT 'messages' AS type, m.id,
            (upper(m.channel) || ' ' || m.direction || ' • ' || to_char(m.created_at,'YYYY-MM-DD HH24:MI')) AS title,
            ts_rank(m.search_doc, plainto_tsquery('english', ${q})) AS rank,
            ts_headline('english', coalesce(m.body,''), plainto_tsquery('english', ${q})) AS snippet
          FROM comm_messages m
          WHERE m.contact_id = ${contactId}
            AND m.search_doc @@ plainto_tsquery('english', ${q})
          ORDER BY rank DESC, m.created_at DESC
          LIMIT ${limit}
        `;
        
        const messagesResult = await db.execute(messagesQuery);
        if (messagesResult.rows) {
          list.push(...messagesResult.rows);
        }
      } catch (error) {
        console.error("Messages search error:", error);
      }

      try {
        // Documents search
        const documentsQuery = sql`
          SELECT 'documents' AS type, d.id,
            (coalesce(d.file_name,'Document') || ' • ' || coalesce(d.file_type,'')) AS title,
            ts_rank(d.search_doc, plainto_tsquery('english', ${q})) AS rank,
            ts_headline('english', coalesce(d.file_name,'') || ' ' || coalesce(d.file_type,''), plainto_tsquery('english', ${q})) AS snippet
          FROM documents d
          WHERE d.application_id IN (SELECT id FROM applications WHERE user_id = ${contactId})
            AND d.search_doc IS NOT NULL
            AND d.search_doc @@ plainto_tsquery('english', ${q})
          ORDER BY rank DESC, d.created_at DESC
          LIMIT ${limit}
        `;
        
        const documentsResult = await db.execute(documentsQuery);
        if (documentsResult.rows) {
          list.push(...documentsResult.rows);
        }
      } catch (error) {
        console.error("Documents search error:", error);
      }

      try {
        // Applications search
        const applicationsQuery = sql`
          SELECT 'applications' AS type, a.id,
            (coalesce(a.business_legal_name, 'Application') || ' • ' || coalesce(a.status, '')) AS title,
            ts_rank(a.search_doc, plainto_tsquery('english', ${q})) AS rank,
            ts_headline('english', coalesce(a.business_legal_name,'') || ' ' || coalesce(a.use_of_funds,''), plainto_tsquery('english', ${q})) AS snippet
          FROM applications a
          WHERE a.user_id = ${contactId}
            AND a.search_doc IS NOT NULL
            AND a.search_doc @@ plainto_tsquery('english', ${q})
          ORDER BY rank DESC, a.created_at DESC
          LIMIT ${limit}
        `;
        
        const applicationsResult = await db.execute(applicationsQuery);
        if (applicationsResult.rows) {
          list.push(...applicationsResult.rows);
        }
      } catch (error) {
        console.error("Applications search error:", error);
      }
    } else {
      // No query - return recent items
      try {
        const recentQuery = sql`
          (SELECT 'messages' AS type, m.id,
            (upper(m.channel) || ' ' || m.direction || ' • ' || to_char(m.created_at,'YYYY-MM-DD HH24:MI')) AS title,
            0 AS rank,
            substring(coalesce(m.body, ''), 1, 200) AS snippet
          FROM comm_messages m
          WHERE m.contact_id = ${contactId}
          ORDER BY m.created_at DESC
          LIMIT 10)
          UNION ALL
          (SELECT 'documents' AS type, d.id,
            (coalesce(d.file_name,'Document') || ' • ' || coalesce(d.file_type,'')) AS title,
            0 AS rank,
            coalesce(d.file_type, '') AS snippet
          FROM documents d
          WHERE d.application_id IN (SELECT id FROM applications WHERE user_id = ${contactId})
          ORDER BY d.created_at DESC
          LIMIT 10)
          ORDER BY type, title
        `;
        
        const recentResult = await db.execute(recentQuery);
        if (recentResult.rows) {
          list.push(...recentResult.rows);
        }
      } catch (error) {
        console.error("Recent items query error:", error);
      }
    }

    // Sort by rank if we have rankings, otherwise by type and title
    if (q) {
      list.sort((a, b) => (b.rank || 0) - (a.rank || 0));
    }

    res.json(list.slice(0, limit));
  } catch (error) {
    console.error("Search endpoint error:", error);
    res.status(500).json({ error: "Search temporarily unavailable" });
  }
});

// Search suggestions endpoint
router.get("/suggestions", async (req: any, res) => {
  try {
    const contactId = req.contact?.id || req.query.contactId;
    if (!contactId) {
      return res.status(401).json({ error: "Unauthorized - contactId required" });
    }

    const q = String(req.query.q || "").trim();
    if (!q || q.length < 2) {
      return res.json([]);
    }

    // Get search suggestions based on content
    const suggestionsQuery = sql`
      SELECT DISTINCT 
        CASE 
          WHEN type = 'messages' THEN channel
          WHEN type = 'documents' THEN category
          WHEN type = 'applications' THEN status
          ELSE 'other'
        END as suggestion
      FROM (
        SELECT 'messages' as type, channel FROM comm_messages WHERE contact_id = ${contactId} AND channel ILIKE ${`%${q}%`}
        UNION
        SELECT 'documents' as type, category FROM documents WHERE application_id IN (SELECT id FROM applications WHERE contact_id = ${contactId}) AND category ILIKE ${`%${q}%`}
        UNION  
        SELECT 'applications' as type, status FROM applications WHERE contact_id = ${contactId} AND status ILIKE ${`%${q}%`}
      ) suggestions
      WHERE suggestion IS NOT NULL AND suggestion != ''
      LIMIT 10
    `;

    const result = await db.execute(suggestionsQuery);
    const suggestions = (result.rows || []).map((row: any) => row.suggestion);

    res.json(suggestions);
  } catch (error) {
    console.error("Search suggestions error:", error);
    res.json([]);
  }
});

export default router;