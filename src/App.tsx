import { useState, useEffect } from 'react';

interface SheetData {
  sheetName: string;
  sheetId: number;
  headers: string[];
  rowCount: number;
  columnCount: number;
  sampleData: string[][];
}

interface DiscoveryReport {
  spreadsheetId: string;
  spreadsheetTitle: string;
  discoveredAt: string;
  totalSheets: number;
  sheets: SheetData[];
}

function App() {
  const [report, setReport] = useState<DiscoveryReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // โหลดรายงานจาก discovery-report.json
    fetch('/discovery-report.json')
      .then((res) => {
        if (res.ok) {
          return res.json();
        }
        throw new Error('Report not found');
      })
      .then((data) => setReport(data))
      .catch(() => {
        // ไม่พบรายงาน
      });
  }, []);

  const handleDiscover = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/discover', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Discovery failed');
      }

      const data = await response.json();
      setReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          E-Saraban — Phase 1C
        </h1>
        <p className="text-gray-600 mb-8">
          ระบบสารบรรณอิเล็กทรอนิกส์ — เทศบาลตำบลป่งไฮ
        </p>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Google Sheets Discovery
          </h2>

          {!report ? (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">
                ยังไม่มีการค้นพบ sheets
              </div>
              <button
                onClick={handleDiscover}
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? 'กำลังค้นพบ...' : 'เริ่มค้นพบ Sheets'}
              </button>
              {error && (
                <div className="mt-4 text-red-600">{error}</div>
              )}
              <div className="mt-8 text-left bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">คำแนะนำ:</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                  <li>รันคำสั่ง: <code className="bg-gray-200 px-2 py-1 rounded">cd server && npm run phase1c</code></li>
                  <li>รอให้ script เสร็จสิ้น</li>
                  <li>รีเฟรชหน้านี้เพื่อดูผลลัพธ์</li>
                </ol>
              </div>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm text-blue-600 mb-1">Spreadsheet</div>
                  <div className="text-lg font-semibold text-blue-900">
                    {report.spreadsheetTitle}
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm text-green-600 mb-1">Total Sheets</div>
                  <div className="text-lg font-semibold text-green-900">
                    {report.totalSheets}
                  </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-sm text-purple-600 mb-1">Discovered At</div>
                  <div className="text-lg font-semibold text-purple-900">
                    {new Date(report.discoveredAt).toLocaleString('th-TH')}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {report.sheets.map((sheet, index) => (
                  <div key={sheet.sheetId} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {index + 1}. {sheet.sheetName}
                      </h3>
                      <div className="text-sm text-gray-500">
                        Sheet ID: {sheet.sheetId}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="text-sm text-gray-600">Rows</div>
                        <div className="text-lg font-semibold">{sheet.rowCount}</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="text-sm text-gray-600">Columns</div>
                        <div className="text-lg font-semibold">{sheet.columnCount}</div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Headers:</h4>
                      <div className="flex flex-wrap gap-2">
                        {sheet.headers.map((header, i) => (
                          <span
                            key={i}
                            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                          >
                            {header}
                          </span>
                        ))}
                      </div>
                    </div>

                    {sheet.sampleData && sheet.sampleData.length > 1 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Sample Data:</h4>
                        <div className="overflow-x-auto">
                          <table className="min-w-full border-collapse">
                            <thead>
                              <tr className="bg-gray-100">
                                {sheet.headers.map((header, i) => (
                                  <th
                                    key={i}
                                    className="border px-3 py-2 text-left text-sm font-semibold"
                                  >
                                    {header}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {sheet.sampleData.slice(1, 4).map((row, rowIndex) => (
                                <tr key={rowIndex} className="hover:bg-gray-50">
                                  {sheet.headers.map((_, colIndex) => (
                                    <td
                                      key={colIndex}
                                      className="border px-3 py-2 text-sm"
                                    >
                                      {row[colIndex] || '-'}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-8 text-center">
                <button
                  onClick={handleDiscover}
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {loading ? 'กำลังค้นพบ...' : 'รีเฟรชข้อมูล'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Phase 1C Status
          </h2>
          <div className="space-y-2 text-gray-700">
            <div className="flex items-center">
              <span className="text-green-600 mr-2">✅</span>
              <span>Google Sheets Service configured</span>
            </div>
            <div className="flex items-center">
              <span className="text-green-600 mr-2">✅</span>
              <span>Service Account credentials set</span>
            </div>
            <div className="flex items-center">
              <span className={report ? 'text-green-600' : 'text-yellow-600'}>
                {report ? '✅' : '⏳'}
              </span>
              <span className="ml-2">
                {report ? 'All sheets discovered' : 'Waiting for discovery...'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
