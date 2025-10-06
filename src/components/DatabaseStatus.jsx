import React, { useState, useEffect } from 'react'; import { useState, useEffect } from 'react';

import { supabase } from '../lib/supabase'; import { Link } from 'react-router-dom';

import { supabase } from '../lib/supabase';

const DatabaseStatus = () => {
    import { Alert, AlertDescription } from '@/components/ui/alert';

    const [status, setStatus] = useState({
        import { Button } from '@/components/ui/button';

        connected: false, import { CheckCircle, XCircle, Database, AlertTriangle, ExternalLink } from 'lucide-react';

        loading: true,

        error: null, const DatabaseStatus = () => {

            tableCount: 0     const [status, setStatus] = useState('checking');

        }); const [tables, setTables] = useState({});

    const [connectionError, setConnectionError] = useState(null);

    useEffect(() => {

        checkDatabaseStatus(); useEffect(() => {

        }, []); checkDatabaseStatus();

    }, []);

    const checkDatabaseStatus = async () => {

        try {
            const checkDatabaseStatus = async () => {

                setStatus(prev => ({ ...prev, loading: true })); setStatus('checking');

                setConnectionError(null);

                // Test basic connection

                const { data, error } = await supabase        const tableChecks = {

        .from('users')            users: false,

        .select('id', { count: 'exact', head: true }); swap_requests: false,

                    chat_threads: false,

                    if(error) {
                        chat_messages: false,

                            setStatus({
                                announcements: false

          connected: false,
                            };

                        loading: false,

                            error: error.message,        try {

                                tableCount: 0            // Test basic connection first

                            }); const connectionTestPromise = fetch(`${supabase.supabaseUrl}/rest/v1/`, {

                            } else {
                                headers: {

                                    setStatus({ 'apikey': supabase.supabaseKey,

                                    connected: true, 'Authorization': `Bearer ${supabase.supabaseKey}`

          loading: false,
                                }

          error: null,
                            });

                tableCount: data?.length || 0

            }); const connectionTimeoutPromise = new Promise((_, reject) =>

      }                setTimeout(() => reject(new Error('Connection test timeout')), 5000)

    } catch (err) {            );

        setStatus({

            connected: false, try {

                loading: false, const response = await Promise.race([connectionTestPromise, connectionTimeoutPromise]);

                error: err.message,

                tableCount: 0                if(!response.ok) {

        }); setConnectionError(`Supabase connection failed: ${response.status}`);

    } setStatus('error');

}; return;

                }

if (status.loading) {

    return (            } catch (connTimeout) {

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">                setConnectionError('Connection timeout - Supabase may be unreachable');

            <div className="flex items-center">                setStatus('error');

                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-2"></div>                return;

                <span className="text-yellow-800">Checking database connection...</span>            }

            </div>

        </div>            // Now test table existence using REST API directly (bypasses RLS)

    );

    } for (const tableName of Object.keys(tableChecks)) {

        try {

            return (

                <div className={`border rounded-lg p-4 mb-4 ${                    // Use direct REST API call to test table existence

                    status.connected                     const tableTestPromise= fetch(`${supabase.supabaseUrl}/rest/v1/${tableName}?select=id&limit=1`, {

        ?'bg-green-50 border-green-200'                         headers: {

        : 'bg-red-50 border-red-200'                            'apikey': supabase.supabaseKey,

                    }`}>                            'Authorization': `Bearer ${ supabase.supabaseKey }`,

      <div className="flex items-center justify-between">                            'Accept': 'application/json'

        <div className="flex items-center">                        }

          <div className={`w - 3 h - 3 rounded - full mr - 2 ${});

            status.connected ? 'bg-green-500' : 'bg-red-500'

        }`}></div>                    const timeoutPromise = new Promise((_, reject) =>

          <span className={`font - medium ${
            setTimeout(() => reject(new Error(`Timeout checking ${tableName}`)), 3000)

            status.connected ? 'text-green-800' : 'text-red-800'                    );

        } `}>

            Database: {status.connected ? 'Connected' : 'Disconnected'}                    try {

          </span>                        const response = await Promise.race([tableTestPromise, timeoutPromise]);

        </div>

        <button                        if (response.status === 200 || response.status === 406) {

          onClick={checkDatabaseStatus}                            // 200 = table exists and accessible, 406 = table exists but RLS blocks

          className="text-sm px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 transition-colors"                            tableChecks[tableName] = true;

        >                        } else if (response.status === 404) {

          Refresh                            tableChecks[tableName] = false;

        </button>                        } else {

      </div>                            // Assume it exists if we get other errors (like RLS blocks)

                                  tableChecks[tableName] = true;

      {status.error && (                        }

        <div className="mt-2 text-sm text-red-600">                    } catch (timeoutErr) {

          Error: {status.error}                        tableChecks[tableName] = false;

        </div>                    }

      )}                } catch (err) {

                          tableChecks[tableName] = false;

      {status.connected && (                }

        <div className="mt-2 text-sm text-green-600">            }

          Tables accessible ✓

        </div>            setTables(tableChecks);

      )}

    </div>            const allTablesExist = Object.values(tableChecks).every(exists => exists);

  );            setStatus(allTablesExist ? 'ready' : 'missing');

};

        } catch (error) {

export default DatabaseStatus;            setConnectionError(error.message);
            setStatus('error');
            setTables(tableChecks);
        }
    };

    const allTablesReady = Object.values(tables).every(exists => exists);

    if (status === 'checking') {
        return (
            <Alert>
                <Database className="h-4 w-4" />
                <AlertDescription>
                    Checking database connection...
                </AlertDescription>
            </Alert>
        );
    }

    if (status === 'error') {
        return (
            <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                    <div className="space-y-3">
                        <div>
                            <strong>Connection Error</strong>
                        </div>
                        <div className="text-sm">
                            {connectionError ? connectionError : 'Failed to connect to Supabase database.'}
                        </div>
                        <div className="text-sm">
                            Please check:
                            <ul className="list-disc list-inside ml-4 mt-2">
                                <li>Your Supabase URL and API key in .env file</li>
                                <li>Your internet connection</li>
                                <li>Supabase project status</li>
                            </ul>
                        </div>
                        <Button size="sm" onClick={checkDatabaseStatus} className="mt-2">
                            Retry Connection
                        </Button>
                    </div>
                </AlertDescription>
            </Alert>
        );
    }

    if (!allTablesReady) {
        return (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                    <div className="space-y-3">
                        <div>
                            <strong>Database Setup Required</strong>
                        </div>
                        <div className="text-sm">
                            Missing tables detected. Please run the database schema in your Supabase SQL Editor:
                        </div>
                        <div className="space-y-1 text-xs font-mono bg-muted p-2 rounded">
                            {Object.entries(tables).map(([table, exists]) => (
                                <div key={table} className="flex items-center space-x-2">
                                    {exists ?
                                        <CheckCircle className="h-3 w-3 text-green-500" /> :
                                        <XCircle className="h-3 w-3 text-red-500" />
                                    }
                                    <span>{table}</span>
                                </div>
                            ))}
                        </div>
                        <div className="space-y-2">
                            <div className="text-sm font-medium">Setup Steps:</div>
                            <ol className="text-xs space-y-1 list-decimal list-inside">
                                <li>Go to your Supabase Dashboard → SQL Editor</li>
                                <li>Run <code>FRESH_DATABASE_SETUP.sql</code> script</li>
                                <li>Refresh this page</li>
                            </ol>
                            <Button size="sm" onClick={checkDatabaseStatus} className="mt-2 mr-2">
                                Recheck Database
                            </Button>
                            <Link to="/database-setup">
                                <Button size="sm" variant="outline" className="mt-2">
                                    <ExternalLink className="h-3 w-3 mr-1" />
                                    Setup Guide
                                </Button>
                            </Link>
                        </div>
                    </div>
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
                Database is ready! All tables are set up correctly.
            </AlertDescription>
        </Alert>
    );
};

export default DatabaseStatus;