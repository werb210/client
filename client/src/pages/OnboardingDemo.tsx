import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { OnboardingWalkthrough } from '@/components/OnboardingWalkthrough';
import { OnboardingProgress } from '@/components/OnboardingProgress';
import { OnboardingSidebar } from '@/components/OnboardingSidebar';
import { useOnboarding } from '@/hooks/useOnboarding';
import { Link } from 'wouter';
import { 
  Play, 
  RotateCcw, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  ArrowRight,
  Users,
  Target,
  Zap
} from 'lucide-react';

export default function OnboardingDemo() {
  const { state, startOnboarding, resetOnboarding } = useOnboarding();
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showProgress, setShowProgress] = useState(false);

  const features = [
    {
      icon: <Play className="h-6 w-6 text-blue-600" />,
      title: 'Interactive Walkthrough',
      description: 'Step-by-step guidance through the application process',
      features: [
        'Welcome screen with overview',
        'Contextual tips and explanations',
        'Progress tracking with visual indicators',
        'Skip or restart options'
      ]
    },
    {
      icon: <Target className="h-6 w-6 text-green-600" />,
      title: 'Progress Tracking',
      description: 'Real-time tracking of application completion',
      features: [
        'Visual progress bar',
        'Step completion status',
        'Required vs optional indicators',
        'Bypass tracking for documents'
      ]
    },
    {
      icon: <Users className="h-6 w-6 text-purple-600" />,
      title: 'Smart Sidebar',
      description: 'Contextual help and application summary',
      features: [
        'Current step information',
        'Helpful tips and guidance',
        'Quick actions and shortcuts',
        'Application summary display'
      ]
    },
    {
      icon: <Zap className="h-6 w-6 text-orange-600" />,
      title: 'Adaptive Experience',
      description: 'Personalized guidance based on user progress',
      features: [
        'First-time user detection',
        'Contextual help content',
        'Smart defaults and suggestions',
        'Regional field adaptation'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Interactive Onboarding System
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Experience our comprehensive onboarding system designed to guide users through 
            the complex financial application process with intelligent assistance and progress tracking.
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">
                    Walkthrough Status
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {state.isComplete ? 'Completed' : state.hasSeenWalkthrough ? 'Seen' : 'Not Started'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Target className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">
                    Progress Tracking
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Real-time step monitoring
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">
                    Smart Assistance
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Contextual help system
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Demo Controls */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Demo Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button
                onClick={() => setShowWalkthrough(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Play className="h-4 w-4" />
                Start Walkthrough
              </Button>
              
              <Button
                onClick={() => setShowProgress(!showProgress)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Target className="h-4 w-4" />
                {showProgress ? 'Hide' : 'Show'} Progress
              </Button>
              
              <Button
                onClick={() => setShowSidebar(!showSidebar)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                {showSidebar ? 'Hide' : 'Show'} Sidebar
              </Button>
              
              <Button
                onClick={resetOnboarding}
                variant="outline"
                className="flex items-center gap-2 border-orange-300 text-orange-700 hover:bg-orange-50"
              >
                <RotateCcw className="h-4 w-4" />
                Reset All
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2 pt-4 border-t">
              <Link to="/apply/step-1">
                <Button variant="outline" className="flex items-center gap-2">
                  Start Real Application
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              
              <Link to="/side-by-side-application">
                <Button variant="outline" className="flex items-center gap-2">
                  View Side-by-Side
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Features Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {features.map((feature, index) => (
            <Card key={index} className="bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  {feature.icon}
                  {feature.title}
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {feature.features.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Live Demo Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {showProgress && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Progress Component Demo
              </h3>
              <OnboardingProgress />
            </div>
          )}

          {showSidebar && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Sidebar Component Demo
              </h3>
              <div className="relative bg-gray-100 dark:bg-gray-700 rounded-lg p-4 min-h-96">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Sidebar appears on the right side of the application
                </p>
                <div className="text-center">
                  <AlertCircle className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">
                    Check the right side of your screen
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Usage Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>How to Use</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">1</Badge>
                  <span className="font-medium">Start Walkthrough</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Click "Start Walkthrough" to begin the interactive tutorial that guides 
                  users through each step of the application process.
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700">2</Badge>
                  <span className="font-medium">Monitor Progress</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  The progress component automatically tracks completion status and 
                  provides visual feedback on required vs completed steps.
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-purple-50 text-purple-700">3</Badge>
                  <span className="font-medium">Get Contextual Help</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  The smart sidebar provides step-specific tips, application summary, 
                  and quick actions based on current progress.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Components */}
      {showWalkthrough && <OnboardingWalkthrough />}
      {showSidebar && <OnboardingSidebar />}
    </div>
  );
}