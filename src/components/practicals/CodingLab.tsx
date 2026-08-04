import React, { useState, useEffect } from 'react';
import { 
  Play, CheckCircle2, XCircle, Terminal, Code2, Database, 
  Copy, RotateCcw, Sparkles, FileText, Check, Layers, ExternalLink
} from 'lucide-react';
import { 
  PracticalActivity, 
  CodingLabLanguage, 
  CodingTestCase,
  SQLDatabaseTable
} from '../../types';
import { evaluateCodeSubmission, ExecutionResult } from '../../services/practicalService';
import { toast } from 'react-hot-toast';

interface CodingLabProps {
  practical: PracticalActivity;
  initialCode?: string;
  onCodeChange?: (code: string) => void;
  onEvaluate?: (result: ExecutionResult, code: string) => void;
  onAskAIHelp?: (prompt: string) => void;
}

export const CodingLab: React.FC<CodingLabProps> = ({
  practical,
  initialCode,
  onCodeChange,
  onEvaluate,
  onAskAIHelp
}) => {
  const config = practical.codingConfig;
  const language: CodingLabLanguage = config?.language || 'python';
  
  const [code, setCode] = useState<string>(
    initialCode || config?.starterCode || '# Write your solution here\n'
  );
  const [selectedLang, setSelectedLang] = useState<CodingLabLanguage>(language);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'db_tables' | 'test_cases'>('editor');
  const [activeDbTable, setActiveDbTable] = useState<number>(0);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [stdinInput, setStdinInput] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
    } else if (config?.starterCode) {
      setCode(config.starterCode);
    }
  }, [practical.id, initialCode]);

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setCode(val);
    if (onCodeChange) onCodeChange(val);
  };

  const handleRunCode = () => {
    setIsExecuting(true);
    setTimeout(() => {
      const result = evaluateCodeSubmission(
        code,
        selectedLang,
        config?.testCases || [],
        config?.databaseTables
      );
      setExecutionResult(result);
      setIsExecuting(false);
      if (onEvaluate) onEvaluate(result, code);
      if (result.scorePercent === 100) {
        toast.success('All test cases passed successfully!');
      } else {
        toast.error(`Passed ${result.testResults.filter(t => t.passed).length}/${result.testResults.length} test cases`);
      }
    }, 600);
  };

  const handleReset = () => {
    const resetVal = config?.starterCode || '';
    setCode(resetVal);
    if (onCodeChange) onCodeChange(resetVal);
    setExecutionResult(null);
    toast.success('Code reset to starter template');
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Code copied to clipboard');
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col min-h-[600px]">
      {/* Top Header Bar */}
      <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/30">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm md:text-base flex items-center gap-2">
              Edulpha Coding Sandbox
              <span className="px-2 py-0.5 rounded text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono uppercase">
                {selectedLang}
              </span>
            </h3>
            <p className="text-xs text-slate-400">{practical.title}</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          {selectedLang === 'html' && (
            <button
              onClick={() => setActiveTab(activeTab === 'preview' ? 'editor' : 'preview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 transition ${
                activeTab === 'preview' 
                  ? 'bg-amber-500 text-slate-950' 
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{activeTab === 'preview' ? 'Code View' : 'Live Preview'}</span>
            </button>
          )}

          {config?.databaseTables && config.databaseTables.length > 0 && (
            <button
              onClick={() => setActiveTab(activeTab === 'db_tables' ? 'editor' : 'db_tables')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 transition ${
                activeTab === 'db_tables'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>DB Tables ({config.databaseTables.length})</span>
            </button>
          )}

          <button
            onClick={handleCopyCode}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1"
            title="Copy Code"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1"
            title="Reset Starter Code"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {onAskAIHelp && (
            <button
              onClick={() => onAskAIHelp(`Please review and help debug my ${selectedLang} code for "${practical.title}":\n\n\`\`\`${selectedLang}\n${code}\n\`\`\``)}
              className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow-md transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Debug with AI</span>
            </button>
          )}

          <button
            onClick={handleRunCode}
            disabled={isExecuting}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-emerald-900/20 transition disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isExecuting ? 'Running...' : 'Run Code'}</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 flex-1">
        {/* Editor or HTML Preview Panel */}
        <div className="lg:col-span-7 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col">
          {activeTab === 'preview' && selectedLang === 'html' ? (
            <div className="flex-1 bg-white p-2">
              <iframe
                title="Live HTML Preview"
                srcDoc={code}
                className="w-full h-full min-h-[400px] border-0 rounded"
                sandbox="allow-scripts"
              />
            </div>
          ) : activeTab === 'db_tables' && config?.databaseTables ? (
            <div className="flex-1 p-4 bg-slate-900 overflow-y-auto">
              <h4 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
                <Database className="w-4 h-4 text-amber-400" />
                In-Memory Database Sandbox Schema
              </h4>
              <div className="flex space-x-2 border-b border-slate-800 pb-2 mb-4">
                {config.databaseTables.map((tbl, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveDbTable(i)}
                    className={`px-3 py-1 rounded text-xs font-mono font-semibold transition ${
                      activeDbTable === i ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {tbl.tableName}
                  </button>
                ))}
              </div>
              {config.databaseTables[activeDbTable] && (
                <div className="space-y-4 font-mono text-xs">
                  <div>
                    <p className="text-slate-400 mb-1">TABLE SCHEMA:</p>
                    <pre className="bg-slate-950 p-3 rounded text-amber-300 border border-slate-800">
                      {config.databaseTables[activeDbTable].schema}
                    </pre>
                  </div>
                  <div>
                    <p className="text-slate-400 mb-1">SEED DATA SQL:</p>
                    <pre className="bg-slate-950 p-3 rounded text-emerald-400 border border-slate-800 whitespace-pre-wrap">
                      {config.databaseTables[activeDbTable].dataSql}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col relative min-h-[380px]">
              {/* Code Editor Header */}
              <div className="bg-slate-950/80 px-4 py-1.5 text-xs text-slate-400 border-b border-slate-800/80 flex items-center justify-between font-mono">
                <span>main.{selectedLang === 'python' ? 'py' : selectedLang === 'c' ? 'c' : selectedLang === 'sql' ? 'sql' : 'js'}</span>
                <span>Lines: {code.split('\n').length}</span>
              </div>
              <textarea
                value={code}
                onChange={handleCodeChange}
                spellCheck={false}
                className="w-full flex-1 bg-slate-900 text-slate-100 font-mono text-xs md:text-sm p-4 leading-relaxed outline-none resize-none border-0 focus:ring-0 selection:bg-blue-600 selection:text-white"
                placeholder="Write your code here..."
              />
            </div>
          )}
        </div>

        {/* Output & Test Cases Console Panel */}
        <div className="lg:col-span-5 bg-slate-950 p-4 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
              <div className="flex items-center space-x-2 text-slate-300 font-bold text-xs uppercase tracking-wider">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>Execution Output & Console</span>
              </div>
              {executionResult && (
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                  executionResult.scorePercent === 100 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  Score: {executionResult.scorePercent}%
                </span>
              )}
            </div>

            {/* Console Output Display */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 font-mono text-xs text-emerald-400 min-h-[160px] max-h-[240px] overflow-y-auto whitespace-pre-wrap leading-relaxed shadow-inner">
              {isExecuting ? (
                <div className="flex items-center space-x-2 text-amber-400 animate-pulse py-4">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Compiling & Executing test harness...</span>
                </div>
              ) : executionResult ? (
                <>
                  {executionResult.stdout || <span className="text-slate-500">(No standard output produced)</span>}
                  {executionResult.stderr && (
                    <p className="text-red-400 mt-2 pt-2 border-t border-red-900/50">
                      ERRORS:\n{executionResult.stderr}
                    </p>
                  )}
                </>
              ) : (
                <span className="text-slate-500">
                  Press "Run Code" above to execute test harness and view console output.
                </span>
              )}
            </div>
          </div>

          {/* Test Case Evaluation Results */}
          <div className="pt-3 border-t border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
              <span>Automated Test Evaluation</span>
              {config?.testCases && (
                <span className="text-slate-500">{config.testCases.length} Test Cases</span>
              )}
            </h4>

            <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
              {config?.testCases && config.testCases.length > 0 ? (
                config.testCases.map((tc, idx) => {
                  const res = executionResult?.testResults?.find(t => t.testId === tc.id || t.testId === `tc_${idx}`);
                  return (
                    <div
                      key={tc.id || idx}
                      className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-lg flex items-start justify-between text-xs font-mono"
                    >
                      <div className="space-y-1 pr-2">
                        <p className="font-bold text-slate-200">
                          {tc.description || `Test Case ${idx + 1}`}
                        </p>
                        <p className="text-slate-400 text-[11px]">
                          Expected: <span className="text-amber-300">{tc.expectedOutput.replace(/\n/g, ' ')}</span>
                        </p>
                      </div>
                      <div>
                        {res ? (
                          res.passed ? (
                            <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold flex items-center gap-1 text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5" /> PASSED
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded bg-red-500/20 text-red-400 border border-red-500/30 font-bold flex items-center gap-1 text-[11px]">
                              <XCircle className="w-3.5 h-3.5" /> FAILED
                            </span>
                          )
                        ) : (
                          <span className="px-2 py-1 rounded bg-slate-800 text-slate-500 text-[11px]">
                            Pending
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-slate-500 italic">No explicit test cases specified. Evaluation is based on standard output execution.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
