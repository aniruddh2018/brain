"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Brain, Clock, Download, Eye, FileText, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { getAllCognitiveReports, verifySupabaseConnection, getUserCognitiveReports } from "@/lib"
import { toast } from "sonner"
import { format } from "date-fns"
import { NavBar } from "@/components/ui/nav-bar"

// Define the CognitiveReport interface
interface CognitiveReport {
  id: string;
  created_at?: string;
  overall_score?: number;
  summary?: string;
  user_id?: string;
  user_name?: string;
  [key: string]: any; // For other properties
}

// Add a new component for connection diagnostics
function ConnectionDiagnostics({ isVisible, userId }: { isVisible: boolean, userId: string | null }) {
  const [diagnostics, setDiagnostics] = useState<{
    environmentVars: { url: string; key: string };
    connectionTest: { status: string; message: string };
    dataQuery: { status: string; message: string; count?: number };
    userQuery: { status: string; message: string; count?: number };
  }>({
    environmentVars: { url: 'Checking...', key: 'Checking...' },
    connectionTest: { status: 'Pending', message: 'Not started' },
    dataQuery: { status: 'Pending', message: 'Not started' },
    userQuery: { status: 'Pending', message: 'Not started' }
  });

  useEffect(() => {
    const runDiagnostics = async () => {
      if (!userId) {
        setDiagnostics(prev => ({
          ...prev,
          userQuery: { status: 'Failed', message: 'No user ID available' }
        }));
        return;
      }

      // Check environment variables
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
      
      setDiagnostics(prev => ({
        ...prev,
        environmentVars: { 
          url: supabaseUrl ? `${supabaseUrl.substring(0, 8)}...` : 'MISSING', 
          key: supabaseKey ? `${supabaseKey.substring(0, 5)}...` : 'MISSING' 
        }
      }));

      // Test connection
      try {
        setDiagnostics(prev => ({
          ...prev,
          connectionTest: { status: 'Testing', message: 'Connecting to Supabase...' }
        }));
        
        const connectionResult = await verifySupabaseConnection();
        
        setDiagnostics(prev => ({
          ...prev,
          connectionTest: { 
            status: connectionResult.success ? 'Success' : 'Failed', 
            message: connectionResult.success ? 'Connected successfully' : `Failed: ${connectionResult.error}` 
          }
        }));

        // Only proceed with data query if connection was successful
        if (connectionResult.success) {
          // General data query
          setDiagnostics(prev => ({
            ...prev,
            dataQuery: { status: 'Testing', message: 'Querying all cognitive reports...' }
          }));
          
          const reports = await getAllCognitiveReports();
          
          if (Array.isArray(reports)) {
            setDiagnostics(prev => ({
              ...prev,
              dataQuery: { 
                status: 'Success', 
                message: `Retrieved ${reports.length} total reports`, 
                count: reports.length 
              }
            }));
          } else {
            setDiagnostics(prev => ({
              ...prev,
              dataQuery: { 
                status: 'Failed', 
                message: `Received non-array response: ${typeof reports}` 
              }
            }));
          }
          
          // User-specific query
          setDiagnostics(prev => ({
            ...prev,
            userQuery: { status: 'Testing', message: `Querying reports for user ${userId}...` }
          }));
          
          const userReportResult = await getUserCognitiveReports(userId);
          
          if (userReportResult.success && Array.isArray(userReportResult.data)) {
            setDiagnostics(prev => ({
              ...prev,
              userQuery: { 
                status: 'Success', 
                message: `Found ${userReportResult.data.length} reports for this user`, 
                count: userReportResult.data.length 
              }
            }));
          } else {
            setDiagnostics(prev => ({
              ...prev,
              userQuery: { 
                status: 'Failed', 
                message: userReportResult.error || 'No reports found for this user'
              }
            }));
          }
        }
      } catch (error) {
        console.error('Diagnostics error:', error);
        setDiagnostics(prev => ({
          ...prev,
          connectionTest: { status: 'Error', message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` },
          dataQuery: { status: 'Skipped', message: 'Skipped due to connection error' },
          userQuery: { status: 'Skipped', message: 'Skipped due to connection error' }
        }));
      }
    };

    if (isVisible) {
      runDiagnostics();
    }
  }, [isVisible, userId]);

  if (!isVisible) return null;

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6 text-left">
      <h3 className="text-lg font-semibold mb-3">Connection Diagnostics</h3>
      
      <div className="space-y-4 text-sm">
        <div>
          <h4 className="font-medium">Environment Variables</h4>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <div className="bg-gray-50 p-2 rounded">
              <span className="font-medium">SUPABASE_URL:</span> {diagnostics.environmentVars.url}
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <span className="font-medium">SUPABASE_KEY:</span> {diagnostics.environmentVars.key}
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="font-medium">Connection Test</h4>
          <div className="bg-gray-50 p-2 rounded mt-1 flex items-center">
            <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
              diagnostics.connectionTest.status === 'Success' ? 'bg-green-500' :
              diagnostics.connectionTest.status === 'Failed' ? 'bg-red-500' :
              diagnostics.connectionTest.status === 'Testing' ? 'bg-yellow-500' : 'bg-gray-500'
            }`}></span>
            <span>{diagnostics.connectionTest.message}</span>
          </div>
        </div>
        
        <div>
          <h4 className="font-medium">All Reports Query</h4>
          <div className="bg-gray-50 p-2 rounded mt-1 flex items-center">
            <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
              diagnostics.dataQuery.status === 'Success' ? 'bg-green-500' :
              diagnostics.dataQuery.status === 'Failed' ? 'bg-red-500' :
              diagnostics.dataQuery.status === 'Testing' ? 'bg-yellow-500' : 'bg-gray-500'
            }`}></span>
            <span>{diagnostics.dataQuery.message}</span>
          </div>
        </div>
        
        <div>
          <h4 className="font-medium">User Reports Query</h4>
          <div className="bg-gray-50 p-2 rounded mt-1 flex items-center">
            <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
              diagnostics.userQuery.status === 'Success' ? 'bg-green-500' :
              diagnostics.userQuery.status === 'Failed' ? 'bg-red-500' :
              diagnostics.userQuery.status === 'Testing' ? 'bg-yellow-500' : 'bg-gray-500'
            }`}></span>
            <span>{diagnostics.userQuery.message}</span>
          </div>
        </div>
        
        <div className="pt-2 border-t">
          <p className="text-xs text-gray-600">
            User ID: {userId || 'Not available'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function MyReportsPage() {
  const router = useRouter()
  const [reports, setReports] = useState<CognitiveReport[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [showDiagnostics, setShowDiagnostics] = useState(false)
  const [lastError, setLastError] = useState<string | null>(null)
  
  // Extract fetchReports to make it available throughout the component
  const fetchReports = async (userIdParam?: string) => {
    const targetUserId = userIdParam || userId
    if (!targetUserId) {
      toast.error("No user ID available")
      return
    }
    
    try {
      setLoading(true)
      setLastError(null)
      console.log('Starting to fetch reports for user:', targetUserId)
      
      // First verify the Supabase connection
      const connectionStatus = await verifySupabaseConnection()
      if (!connectionStatus.success) {
        const errorMsg = `Connection to database failed: ${connectionStatus.error}`
        console.error('Supabase connection failed:', connectionStatus.error)
        toast.error(errorMsg)
        setLastError(errorMsg)
        setLoading(false)
        return
      }
      
      // Try direct user query first (new method)
      console.log('Attempting direct user query...')
      const userReportResult = await getUserCognitiveReports(targetUserId)
      
      if (userReportResult.success && Array.isArray(userReportResult.data)) {
        console.log(`Direct query found ${userReportResult.data.length} reports for user ${targetUserId}`)
        setReports(userReportResult.data)
        setLoading(false)
        return
      } else {
        const warningMsg = `Direct user query failed: ${userReportResult.error || 'No reports found'}`
        console.warn(warningMsg)
        setLastError(warningMsg)
        console.log('Falling back to scanning all reports...')
      }
      
      // Fallback to scanning all reports (original method)
      const allReports = await getAllCognitiveReports()
      console.log('getAllCognitiveReports returned:', 
        Array.isArray(allReports) ? `${allReports.length} reports` : 'invalid data (not an array)')
      
      if (!Array.isArray(allReports)) {
        const errorMsg = `Expected array from getAllCognitiveReports but got: ${typeof allReports}`
        console.error(errorMsg)
        setLastError(errorMsg)
        toast.error("Invalid data received from the server")
        setLoading(false)
        return
      }
      
      // Filter for just this user's reports
      const myReports = allReports.filter((report: CognitiveReport) => report.user_id === targetUserId) || []
      
      console.log(`Found ${myReports.length} reports for user ${targetUserId} by scanning all reports`)
      if (myReports.length > 0) {
        console.log('First report sample:', {
          id: myReports[0].id,
          user_id: myReports[0].user_id,
          created_at: myReports[0].created_at
        })
      } else {
        const noReportsMsg = `No reports found for user ${targetUserId} after checking both methods`
        console.warn(noReportsMsg)
        setLastError(noReportsMsg)
      }
      
      setReports(myReports)
    } catch (error) {
      console.error("Error fetching reports:", error)
      // More detailed error logging
      if (error instanceof Error) {
        const errorDetails = `Error name: ${error.name}\nMessage: ${error.message}\nStack: ${error.stack}`
        console.error(errorDetails)
        setLastError(errorDetails)
      }
      toast.error("Failed to load your reports")
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    // Check if user is logged in
    const storedUserId = localStorage.getItem("userId")
    if (!storedUserId) {
      // Redirect to login if not logged in
      toast.error("Please sign in to view your reports")
      router.push("/")
      return
    }
    
    setUserId(storedUserId)
    
    // Call the fetchReports function with the stored user ID
    fetchReports(storedUserId)
  }, [router])
  
  const viewReport = (reportId: string) => {
    router.push(`/results?reportId=${reportId}`)
  }
  
  const takeNewAssessment = () => {
    router.push("/games")
  }
  
  // Add this function to handle manual refresh
  const handleRefresh = () => {
    if (!userId) {
      toast.error("No user ID available. Please sign in again.")
      return
    }
    
    toast.info("Refreshing reports...")
    fetchReports(userId)
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Use the shared NavBar component */}
      <NavBar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Assessment Reports</h1>
          <div className="space-x-2">
            <Button onClick={() => setShowDiagnostics(!showDiagnostics)} variant="outline">
              {showDiagnostics ? "Hide Diagnostics" : "Show Diagnostics"}
            </Button>
            <Button onClick={handleRefresh} variant="outline" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
              Refresh
            </Button>
            <Button onClick={takeNewAssessment} className="bg-indigo-600 hover:bg-indigo-700">
              Take New Assessment
            </Button>
          </div>
        </div>
        
        <ConnectionDiagnostics isVisible={showDiagnostics} userId={userId} />
        
        {lastError && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6">
            <h3 className="text-red-800 font-medium mb-2">Error Details</h3>
            <pre className="text-xs overflow-auto bg-white p-2 rounded border border-red-100">
              {lastError}
            </pre>
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
            <span className="ml-2 text-lg text-gray-700">Loading your reports...</span>
          </div>
        ) : reports.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No Reports Yet</h2>
            <p className="text-gray-600 mb-6">You haven't completed any cognitive assessments yet.</p>
            <Button onClick={takeNewAssessment} className="bg-indigo-600 hover:bg-indigo-700">
              Start Your First Assessment
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report) => (
              <Card key={report.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white">
                  <CardTitle className="flex items-center justify-between">
                    <span>Cognitive Assessment</span>
                    <span className="text-sm bg-white/20 px-2 py-1 rounded-full text-white">
                      Score: {report.overall_score ?? 'N/A'}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center text-gray-700">
                      <Clock className="h-4 w-4 mr-2" />
                      <span className="text-sm">
                        {report.created_at 
                          ? format(new Date(report.created_at), 'PPP') 
                          : 'Date not available'}
                      </span>
                    </div>
                    <p className="text-gray-600 line-clamp-3">
                      {report.summary || 
                       `This report contains ${report.user_name || 'your'} cognitive assessment results, including strengths, weaknesses, and personalized recommendations.`}
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 border-t flex justify-between">
                  <Button variant="ghost" size="sm" onClick={() => viewReport(report.id)}>
                    <Eye className="h-4 w-4 mr-1" /> View Details
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4 mr-1" /> Download PDF
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 