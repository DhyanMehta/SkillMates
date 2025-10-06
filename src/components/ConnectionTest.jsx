import React, { useState } from 'react'; import { useState } from 'react';

import { supabase } from '../lib/supabase'; import { Button } from '@/components/ui/button';

import { Alert, AlertDescription } from '@/components/ui/alert';

const ConnectionTest = () => {
    import { TestTube, CheckCircle, XCircle } from 'lucide-react';

    const [testResults, setTestResults] = useState({

        supabase: null, const ConnectionTest = () => {

            users: null,    const [testing, setTesting] = useState(false);

            requests: null,    const [result, setResult] = useState(null);

            testing: false

        }); const testConnection = async () => {

            setTesting(true);

            const runTests = async () => {
                setResult(null);

                setTestResults({ supabase: null, users: null, requests: null, testing: true });

                try {

                    // Test 1: Supabase Connection            console.log('🧪 Starting manual connection test...');

                    try {

                        const { data, error } = await supabase.auth.getSession();            // Test 1: Environment variables

                        setTestResults(prev => ({
                            const url = import.meta.env.VITE_SUPABASE_URL;

                            ...prev, const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

                            supabase: error ? { success: false, error: error.message } : { success: true, data: 'Connected' }

                        })); if (!url || !key) {

                        } catch (error) {
                            throw new Error('Missing environment variables');

                            setTestResults(prev => ({}

        ...prev,

                                supabase: { success: false, error: error.message }            console.log('✅ Environment variables found');

                        }));

                    }            // Test 2: Basic fetch to Supabase REST API

            const response = await fetch(`${url}/rest/v1/`, {

                        // Test 2: Users Table                method: 'GET',

                        try {
                            headers: {

                                const { data, error } = await supabase                    'apikey': key,

        .from('users')                    'Authorization': `Bearer ${key}`,

        .select('id')                    'Content-Type': 'application/json'

                                    .limit(1);
                            }

                        });

                    setTestResults(prev => ({

                        ...prev, console.log('📡 Fetch response:', response.status, response.statusText);

                        users: error ? { success: false, error: error.message } : { success: true, data: `Found ${data?.length || 0} records` }

                    })); if (!response.ok) {

                    } catch (error) {
                        const errorText = await response.text();

                        setTestResults(prev => ({
                            throw new Error(`HTTP ${response.status}: ${errorText}`);

                            ...prev,
                        }

        users: { success: false, error: error.message }

      }));            // Test 3: Try to get OpenAPI spec (this should work even without tables)

                }            const openApiResponse = await fetch(`${url}/rest/v1/`, {

                    headers: {

                        // Test 3: Requests Table                      'apikey': key,

                        try {
                            'Accept': 'application/openapi+json'

      const { data, error } = await supabase
                        }

                            .from('requests')
                    });

        .select('id')

    .limit(1); console.log('📋 OpenAPI response:', openApiResponse.status);



setTestResults(prev => ({ if(openApiResponse.ok) {

    ...prev, const spec = await openApiResponse.json();

    requests: error ? { success: false, error: error.message } : { success: true, data: `Found ${data?.length || 0} records` }, console.log('📋 OpenAPI spec retrieved:', Object.keys(spec));

    testing: false

})); setResult({

} catch (error) {
    success: true,

        setTestResults(prev => ({
            message: 'Connection successful! Supabase is reachable.',

            ...prev, details: {

                requests: { success: false, error: error.message }, url: url.substring(0, 30) + '...',

                testing: false                        keyLength: key.length,

            })); openApiPaths: Object.keys(spec.paths || {}).length

}                    }

  };                });

            } else {

    const TestResult = ({ label, result }) => {
        throw new Error('OpenAPI endpoint not accessible');

        if (!result) { }

        return (

            <div className="flex items-center justify-between p-3 bg-gray-50 border rounded">        } catch (error) {

                <span className="font-medium">{label}</span>            console.error('❌ Connection test failed:', error);

                <span className="text-gray-500">Not tested</span>            setResult({

        </div>                success: false,

      ); message: error.message,

    } details: {

    url: import.meta.env.VITE_SUPABASE_URL?.substring(0, 30) + '...' || 'Not found',

    return (hasKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY

      <div className = {`flex items-center justify-between p-3 border rounded ${                }

        result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'            });

      }`}>        } finally {

    <span className="font-medium">{label}</span>            setTesting(false);

    <div className="text-right">        }

        <div className={`text-sm font-medium ${    };

            result.success ? 'text-green-700' : 'text-red-700'

          }`}>    return (

            {result.success ? '✓ Success' : '✗ Failed'}        <div className="space-y-4">

            </div>            <Button

                {result.data && (onClick = { testConnection }

                    < div className="text-xs text-gray-600">{result.data}</div>                disabled={testing}

          )}                className="w-full"

        {result.error && (            >

            <div className="text-xs text-red-600">{result.error}</div>                <TestTube className="h-4 w-4 mr-2" />

        )}                {testing ? 'Testing Connection...' : 'Test Supabase Connection'}

    </div>            </Button >

      </div >

    ); {
        result && (

  };                <Alert variant={result.success ? 'default' : 'destructive'}>

                    {result.success ? (

  return (                        <CheckCircle className="h-4 w-4 text-green-600" />

    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">                    ) : (

      <div className="flex items-center justify-between mb-4">                        <XCircle className="h-4 w-4" />

        <h3 className="font-medium text-gray-800">Connection Tests</h3>                    )}

        <button                    <AlertDescription>

          onClick={runTests}                        <div className="space-y-2">

          disabled={testResults.testing}                            <div className="font-medium">

          className={`px-4 py-2 rounded text-sm font-medium transition-colors ${                                {result.success ? 'Connection Successful!' : 'Connection Failed'}

            testResults.testing                            </div>

              ? 'bg-gray-100 text-gray-500 cursor-not-allowed'                            <div className="text-sm">{result.message}</div>

              : 'bg-blue-500 text-white hover:bg-blue-600'                            {result.details && (

          }`}                                <div className="text-xs font-mono bg-muted p-2 rounded space-y-1">

        >                                    {Object.entries(result.details).map(([key, value]) => (

          {testResults.testing ? 'Testing...' : 'Run Tests'}                                        <div key={key}>{key}: {String(value)}</div>

        </button>                                    ))}

      </div>                                </div>

                                  )}

      <div className="space-y-3">                        </div>

        <TestResult label="Supabase Connection" result={testResults.supabase} />                    </AlertDescription>

        <TestResult label="Users Table Access" result={testResults.users} />                </Alert >

        <TestResult label="Requests Table Access" result={testResults.requests} />            )
}

      </div >        </div >

          );

{ testResults.testing && (};

<div className="mt-4 flex items-center justify-center">

    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>export default ConnectionTest;
    <span className="ml-2 text-blue-600">Running connection tests...</span>
</div>
      )}
    </div >
  );
};

export default ConnectionTest;