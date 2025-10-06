import React, { useState, useEffect } from 'react'; import { useState, useEffect } from 'react';

import { getAllUsers, getUserById } from '../services/userService'; import { Alert, AlertDescription } from '@/components/ui/alert';

import { getAllRequests } from '../services/requestService'; import { Button } from '@/components/ui/button';

import { Info } from 'lucide-react';

const DebugInfo = () => {

    const [debugData, setDebugData] = useState({
        const DebugInfo = () => {

            users: [],    const [envInfo, setEnvInfo] = useState({});

            requests: [],    const [showDebug, setShowDebug] = useState(false);

            loading: true,

                error: null    useEffect(() => {

                }); const url = import.meta.env.VITE_SUPABASE_URL;

            const [showDetails, setShowDetails] = useState(false); const key = import.meta.env.VITE_SUPABASE_ANON_KEY;



            useEffect(() => {
                setEnvInfo({

                    loadDebugData();            hasUrl: !!url,

                }, []); hasKey: !!key,

                    urlLength: url ? url.length : 0,

  const loadDebugData = async () => {
                    keyLength: key ? key.length : 0,

    try {
                        mode: import.meta.env.MODE,

                            setDebugData(prev => ({ ...prev, loading: true, error: null })); dev: import.meta.env.DEV

                    });

            const [users, requests] = await Promise.all([    }, []);

    getAllUsers(),

        getAllRequests()    if (!showDebug) {

      ]); return (

    <Button

        setDebugData({
            variant="outline"

        users: users || [], size="sm"

        requests: requests || [], onClick={() => setShowDebug(true)
        }

        loading: false, className = "mb-4"

        error: null >

      }); <Info className="h-4 w-4 mr-2" />

    } catch (error) {                Show Debug Info

    console.error('Debug data loading error:', error);            </Button >

        setDebugData(prev => ({        );

        ...prev,    }

loading: false,

    error: error.message    return (

      })); <Alert className="mb-4">

    }            <Info className="h-4 w-4" />

  };            <AlertDescription>

        <div className="space-y-2">

            if (debugData.loading) {<div className="font-medium">Environment Debug Info:</div>

    return (                    <div className="text-sm font-mono space-y-1">

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">                        <div>Mode: {envInfo.mode}</div>

                    <div className="flex items-center">                        <div>Dev: {String(envInfo.dev)}</div>

                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>                        <div>Supabase URL: {envInfo.hasUrl ? `Found (${envInfo.urlLength} chars)` : 'Missing'}</div>

                        <span className="text-blue-800">Loading debug information...</span>                        <div>API Key: {envInfo.hasKey ? `Found (${envInfo.keyLength} chars)` : 'Missing'}</div>

                    </div>                    </div>

            </div>                    <Button

    );                        variant="outline"

  }                        size="sm"

            onClick={() => setShowDebug(false)}

  return (                    >

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">                        Hide Debug

                <div className="flex items-center justify-between mb-3">                    </Button>

                <h3 className="font-medium text-gray-800">Debug Information</h3>                </div>

            <div className="flex space-x-2">            </AlertDescription>

            <button        </Alert>

        onClick={() => setShowDetails(!showDetails)}    );

            className="text-sm px-3 py-1 rounded bg-blue-100 hover:bg-blue-200 text-blue-700 transition-colors"};

          >

        {showDetails ? 'Hide Details' : 'Show Details'}export default DebugInfo;
    </button>
    <button
        onClick={loadDebugData}
        className="text-sm px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 transition-colors"
    >
        Refresh
    </button>
</div>
      </div >

{
    debugData.error && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            Error: {debugData.error}
        </div>
    )
}

    < div className = "grid grid-cols-2 gap-4 text-sm" >
        <div className="bg-white p-3 rounded border">
          <div className="font-medium text-gray-700 mb-1">Users</div>
          <div className="text-2xl font-bold text-blue-600">{debugData.users.length}</div>
        </div>
        <div className="bg-white p-3 rounded border">
          <div className="font-medium text-gray-700 mb-1">Requests</div>
          <div className="text-2xl font-bold text-green-600">{debugData.requests.length}</div>
        </div>
      </div >

    { showDetails && (
        <div className="mt-4 space-y-3">
            <div>
                <h4 className="font-medium text-gray-700 mb-2">Recent Users</h4>
                <div className="bg-white border rounded max-h-40 overflow-y-auto">
                    {debugData.users.slice(0, 5).map((user, index) => (
                        <div key={user.id || index} className="p-2 border-b last:border-b-0 text-sm">
                            <div className="font-medium">{user.name || 'Unknown'}</div>
                            <div className="text-gray-500">
                                Skills: {user.skills?.length || 0} | Rating: {user.rating || 'N/A'}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <h4 className="font-medium text-gray-700 mb-2">Recent Requests</h4>
                <div className="bg-white border rounded max-h-40 overflow-y-auto">
                    {debugData.requests.slice(0, 5).map((request, index) => (
                        <div key={request.id || index} className="p-2 border-b last:border-b-0 text-sm">
                            <div className="font-medium">{request.skill || 'Unknown Skill'}</div>
                            <div className="text-gray-500">
                                Status: {request.status || 'N/A'} |
                                From: {request.requester_name || 'Unknown'}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )}
    </div >
  );
};

export default DebugInfo;