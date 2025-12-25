import React, { useCallback, useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";
import PageLayout from "@/components/common/PageLayout";

type RowData = Record<string, string>;

const TARGET_HEADERS = [
  "スタッフコード",
  "姓",
  "名",
  "支給日",
  "給与規定グループ名",
  "基本給",
  "課税通勤手当",
  "非課税通勤手当",
  "残業手当",
  "深夜労働手当",
  "休日労働手当",
  "欠勤控除",
  "遅刻早退控除",
  "歩合給",
  "年末調整分",
  "賞与",
  "年末調整",
  "健康保険料",
  "介護保険料",
  "厚生年金保険料",
  "雇用保険料",
  "所得税",
  "住民税",
  "年末調整精算用",
  "備考",
] as const;

// 和暦(令和)を西暦YYYY-MM-DDに変換
function convertWarekiToSeireki(warekiStr: string): string {
  if (!warekiStr) return "";
  const match = warekiStr.match(/令和(\d+)年(\d+)月(\d+)日/);
  if (match) {
    const year = parseInt(match[1], 10) + 2018;
    const month = match[2].padStart(2, "0");
    const day = match[3].padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  return warekiStr.replace(/支給日：\s*/, "").trim();
}

function parseSalarySheet(sheetArray: unknown[][]): RowData {
  console.log("[parseSalarySheet] sheetArray: ", sheetArray);
  const getVal = (r: number, c: number) => {
    try {
      const raw = sheetArray?.[r]?.[c];
      const val = raw !== undefined && raw !== null ? String(raw).trim() : "";
      return val === "undefined" ? "" : val;
    } catch {
      return "";
    }
  };
  // 文字のゆれを潰して比較用キーにする（全角半角、空白、コロンなど）
  const norm = (s: string) =>
    (s ?? "")
      .toString()
      .normalize("NFKC")
      .trim()
      .replace(/[ 　\t\r\n]+/g, "") // 空白類を除去
      .replace(/[：:]/g, ""); // コロンを除去（あってもなくても一致させる）

  // ラベル -> (row, col) の索引を1回で作る（最初に見つかった場所を採用）
  const labelIndex = new Map<string, { r: number; c: number }>();
  for (let r = 0; r < (sheetArray?.length ?? 0); r++) {
    const row = sheetArray?.[r] ?? [];
    for (let c = 0; c < row.length; c++) {
      const key = norm(getVal(r, c));
      if (!key) continue;
      if (!labelIndex.has(key)) labelIndex.set(key, { r, c });
    }
  }
  const getBelowByLabels = (
    labels: string[] | string,
    opt?: { defaultValue?: string; allowContainsFallback?: boolean }
  ) => {
    const defaultValue = opt?.defaultValue ?? "";
    const allowContainsFallback = opt?.allowContainsFallback ?? true;

    const arr = Array.isArray(labels) ? labels : [labels];

    // 1) まずは完全一致（正規化後）
    for (const label of arr) {
      const hit = labelIndex.get(norm(label));
      if (hit) {
        return getVal(hit.r + 1, hit.c) || defaultValue;
      }
    }

    // 2) 見つからない場合、セル側に余計な文字が付くケースのため contains fallback
    //    例: "基本給(課税)" のようなセルでも "基本給" で拾える
    if (allowContainsFallback) {
      const keys = [...labelIndex.keys()];
      for (const label of arr) {
        const nk = norm(label);
        const foundKey = keys.find((k) => k.includes(nk));
        if (foundKey) {
          const hit = labelIndex.get(foundKey)!;
          return getVal(hit.r + 1, hit.c) || defaultValue;
        }
      }
    }

    return defaultValue;
  };

  const fullName = getVal(6, 1).replace(/　様$/, "").replace(/様$/, "").trim();

  // 姓名分割（全角・半角スペース両方対応）
  const nameParts = fullName.split(/[\s　]+/);
  const sei = nameParts[0] || "";
  const mei = nameParts.slice(1).join(" ") || "";

  const row: RowData = {
    スタッフコード: "", // 明細にないため空
    姓: sei,
    名: mei,
    基本給: getBelowByLabels("基本給", { defaultValue: "0" }),
    課税通勤手当: getBelowByLabels(["課税通勤手当", "課税交通費"], {
      defaultValue: "0",
    }),
    非課税通勤手当: getBelowByLabels(["非課税通勤手当", "非課税交通費"], {
      defaultValue: "0",
    }),

    残業手当: getBelowByLabels(["残業手当", "時間外手当"], {
      defaultValue: "0",
    }),
    深夜労働手当: getBelowByLabels(["深夜労働手当", "深夜手当"], {
      defaultValue: "0",
    }),
    休日労働手当: getBelowByLabels(["休日労働手当", "休日手当"], {
      defaultValue: "0",
    }),

    欠勤控除: getBelowByLabels(["欠勤控除", "欠勤"], { defaultValue: "0" }),
    遅刻早退控除: getBelowByLabels(["遅刻早退控除", "遅刻早退"], {
      defaultValue: "0",
    }),

    歩合給: getBelowByLabels(["歩合給", "処遇改善加算"], { defaultValue: "0" }),

    年末調整分: getBelowByLabels(["年末調整分", "年末調整"], {
      defaultValue: "0",
    }),
    賞与: getBelowByLabels(["賞与", "ボーナス"], { defaultValue: "0" }),
    年末調整: getBelowByLabels(["年末調整", "年末調整額"], {
      defaultValue: "",
    }),

    健康保険料: getBelowByLabels(["健康保険料", "健康保険"], {
      defaultValue: "0",
    }),
    介護保険料: getBelowByLabels(["介護保険料", "介護保険"], {
      defaultValue: "0",
    }),
    厚生年金保険料: getBelowByLabels(["厚生年金保険料", "厚生年金"], {
      defaultValue: "0",
    }),
    雇用保険料: getBelowByLabels(["雇用保険料", "雇用保険"], {
      defaultValue: "0",
    }),

    所得税: getBelowByLabels(["所得税", "源泉所得税"], { defaultValue: "0" }),
    住民税: getBelowByLabels(["住民税", "市町村民税"], { defaultValue: "0" }),

    年末調整精算用: getBelowByLabels(["年末調整精算用", "年末調整精算"], {
      defaultValue: "0",
    }),

    支給日: convertWarekiToSeireki(getVal(0, 24) || getVal(0, 21)),
    給与規定グループ名: "",

    備考: getVal(11, 0)
      .replace(/　給与明細書$/, "")
      .trim(),
  };

  return row;
}

async function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}

export default function SalaryConverterTool() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isDragOver, setIsDragOver] = useState(false);
  const [status, setStatus] = useState<{
    text: string;
    colorClass: string;
  } | null>(null);
  const [convertedData, setConvertedData] = useState<RowData[]>([]);

  const hasResult = convertedData.length > 0;

  const showMessage = useCallback((text: string, colorClass: string) => {
    setStatus({ text, colorClass });
  }, []);

  const handleFile = useCallback(
    async (file: File) => {
      showMessage("詳細データを解析中...", "text-blue-600");
      try {
        const buffer = await readFileAsArrayBuffer(file);
        const data = new Uint8Array(buffer);
        const workbook = XLSX.read(data, { type: "array" });

        const results: RowData[] = [];

        workbook.SheetNames.forEach((sheetName: string) => {
          const worksheet = workbook.Sheets[sheetName];
          const sheetArray = XLSX.utils.sheet_to_json<unknown[]>(worksheet, {
            header: 1,
            defval: "",
          }) as unknown[][];

          if (!sheetArray || sheetArray.length < 15) return;

          const extracted = parseSalarySheet(sheetArray);
          if (extracted["姓"]) results.push(extracted);
        });

        if (results.length === 0) {
          setConvertedData([]);
          showMessage(
            "有効な給与明細データが検出できませんでした。",
            "text-red-600"
          );
          return;
        }

        setConvertedData(results);
        showMessage(
          `抽出完了: ${results.length}名分のデータを集計フォーマットに変換しました。`,
          "text-green-600"
        );
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
        setConvertedData([]);
        showMessage("解析中にエラーが発生しました。", "text-red-600");
      } finally {
        // 同じファイルをもう一度選べるようにクリア
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [showMessage]
  );

  const onPickFile = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) void handleFile(file);
    },
    [handleFile]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const onDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) void handleFile(file);
    },
    [handleFile]
  );

  const downloadCsv = useCallback(() => {
    if (!hasResult) return;

    const csvRows: string[] = [TARGET_HEADERS.join(",")];

    convertedData.forEach((row) => {
      const values = TARGET_HEADERS.map((h) => {
        const val = String(row[h] || "");
        return `"${val.replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(","));
    });

    const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
    const blob = new Blob([bom, csvRows.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `給与集計データ_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [convertedData, hasResult]);

  const specBadges = useMemo(
    () => [
      "姓名の自動分割",
      "和暦→西暦変換",
      "社会保険/税金の抽出",
      "処遇改善加算→歩合給",
    ],
    []
  );

  return (
    <PageLayout>
      <div
        style={{
          //   backgroundColor: "#f3f4f6", // bg-gray-100
          minHeight: "100vh",
          fontFamily:
            "'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif",
        }}
      >
        <div
          style={{
            maxWidth: "56rem", // max-w-4xl
            margin: "0 auto",
            paddingTop: "2.5rem", // py-10
            paddingBottom: "2.5rem",
            paddingLeft: "0.5rem", // px-2
            paddingRight: "0.5rem",
            boxSizing: "border-box",
          }}
        >
          {/* ヘッダー */}
          <header
            style={{
              textAlign: "center",
              marginBottom: "2rem", // mb-8
            }}
          >
            <h1
              style={{
                fontSize: "2rem", // text-2xl
                fontWeight: 700,
                color: "#1f2937", // text-gray-800
                marginBottom: "0.5rem", // mb-2
                letterSpacing: "-0.01em",
              }}
            >
              給与データ集計ツール
            </h1>
            <p
              style={{
                fontSize: "1rem", // text-base
                color: "#6b7280", // text-gray-500
              }}
            >
              個別明細Excelを読み込み、指定の集計用フォーマットCSVに変換します
            </p>
          </header>

          {/* 仕様バッジ */}
          <div
            style={{
              background: "#fff",
              border: "1px solid #e5e7eb", // border-gray-200
              borderRadius: "0.5rem", // rounded-lg
              padding: "1.5rem", // p-6 (since md:p-6)
              marginBottom: "2rem", // mb-8
              boxShadow:
                "0 1px 3px 0 rgba(0,0,0,0.04), 0 1px 2px 0 rgba(0,0,0,0.01)", // shadow
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "0.5rem", // mb-2
                gap: "0.5rem",
              }}
            >
              <svg
                width={10}
                height={10}
                style={{ color: "#3b82f6" }}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
              </svg>
              <h2
                style={{
                  fontSize: "0.875rem", // text-sm
                  fontWeight: "bold",
                  color: "#374151", // text-gray-700
                  margin: 0,
                }}
              >
                出力フォーマットの仕様
              </h2>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, minmax(0, 1fr))", // sm:grid-cols-4
                gap: "0.5rem",
                fontSize: "0.875rem", // text-xs
                color: "#6b7280", // text-gray-500
              }}
            >
              {specBadges.map((t) => (
                <div
                  key={t}
                  style={{
                    background: "#f9fafb", // bg-gray-50
                    padding: "0.25rem 0.5rem", // px-2 py-1
                    borderRadius: "0.25rem",
                    textAlign: "center",
                    border: "1px solid #f3f4f6", // border-gray-100
                  }}
                >
                  {t}
                </div>
              ))}
            </div>
          </div>

          {/* ファイルアップロードエリア */}
          <div
            role="button"
            tabIndex={0}
            onClick={onPickFile}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") onPickFile();
            }}
            style={{
              borderWidth: "2px",
              borderStyle: "dashed",
              borderRadius: "0.75rem",
              paddingTop: "3rem",
              paddingBottom: "3rem",
              paddingLeft: "1rem",
              paddingRight: "1rem",
              textAlign: "center",
              background: "#fff",
              cursor: "pointer",
              boxShadow:
                "0 1px 3px 0 rgba(0,0,0,0.04), 0 1px 2px 0 rgba(0,0,0,0.01)",
              borderColor: isDragOver ? "#3b82f6" : "#d1d5db", // blue-500 or gray-300
              transition: "border-color 0.15s, background 0.15s",
              outline: "none",
              marginBottom: "0",
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              style={{ display: "none" }}
              accept=".xlsx,.xls"
              onChange={onInputChange}
            />

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <div
                style={{
                  padding: "1rem",
                  background: "#eff6ff", // bg-blue-50
                  borderRadius: "9999px",
                  transition: "background 0.15s",
                }}
              >
                <svg
                  width={32}
                  height={32}
                  style={{ color: "#3b82f6" }} // text-blue-500
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              <p
                style={{
                  color: "#4b5563", // text-gray-600
                  fontWeight: 500,
                  fontSize: "1rem",
                }}
              >
                給与明細のExcelファイルをここにドロップ
              </p>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "#9ca3af", // text-gray-400
                }}
              >
                またはクリックしてファイルを選択
              </p>
            </div>
          </div>

          {/* ステータスメッセージ */}
          {status && (
            <div
              style={{
                marginTop: "1rem",
                textAlign: "center",
              }}
            >
              <p
                className={`text-base font-bold ${status.colorClass}`}
                style={{
                  fontSize: "1rem",
                  fontWeight: "bold",
                  ...(status.colorClass?.includes("text-green-600")
                    ? { color: "#16a34a", margin: 0 }
                    : status.colorClass?.includes("text-red-600")
                    ? { color: "#dc2626", margin: 0 }
                    : status.colorClass?.includes("text-blue-600")
                    ? { color: "#2563eb", margin: 0 }
                    : { margin: 0 }),
                }}
              >
                {status.text}
              </p>
            </div>
          )}

          {/* 結果プレビュー */}
          {hasResult && (
            <div
              style={{
                marginTop: "2.5rem", // mt-10
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem", // space-y-6
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  gap: "1rem",
                }}
              >
                <div>
                  <h2
                    style={{
                      fontSize: "1.125rem", // text-lg
                      fontWeight: "bold",
                      color: "#1f2937", // text-gray-800
                      margin: 0,
                    }}
                  >
                    抽出結果プレビュー
                  </h2>
                  <p
                    style={{
                      fontSize: "0.875rem", // text-xs
                      color: "#6b7280", // text-gray-500
                      margin: 0,
                    }}
                  >
                    ※「in.csv」の列構成に合わせています
                  </p>
                </div>
                <button
                  onClick={downloadCsv}
                  style={{
                    background: "#2563eb", // bg-blue-600
                    color: "#fff",
                    padding: "0.625rem 1.5rem",
                    borderRadius: "0.375rem",
                    fontWeight: "bold",
                    border: "none",
                    boxShadow:
                      "0 1px 3px 0 rgba(0,0,0,0.04), 0 1px 2px 0 rgba(0,0,0,0.01)",
                    cursor: "pointer",
                    transition:
                      "background 0.15s, box-shadow 0.15s, color 0.15s",
                  }}
                  onMouseOver={
                    (e) =>
                      ((e.target as HTMLButtonElement).style.background =
                        "#1d4ed8") // hover:bg-blue-700
                  }
                  onMouseOut={(e) =>
                    ((e.target as HTMLButtonElement).style.background =
                      "#2563eb")
                  }
                >
                  集計用CSVをダウンロード
                </button>
              </div>

              <div
                style={{
                  background: "#fff",
                  boxShadow:
                    "0 1px 3px 0 rgba(0,0,0,0.04), 0 1px 2px 0 rgba(0,0,0,0.01)",
                  borderRadius: "0.5rem",
                  border: "1px solid #e5e7eb",
                  overflow: "auto",
                  maxHeight: "60vh",
                }}
              >
                <table
                  style={{
                    minWidth: 650,
                    width: "100%",
                    fontSize: "0.9375rem",
                    background: "#fff",
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        position: "sticky",
                        top: 0,
                        background: "#f9fafb", // bg-gray-50
                        zIndex: 10,
                      }}
                    >
                      {TARGET_HEADERS.map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: "0.5rem 0.5rem",
                            textAlign: "left",
                            fontWeight: "bold",
                            color: "#4b5563", // text-gray-600
                            textTransform: "uppercase",
                            borderBottom: "1px solid #f9fafb",
                            background: "#f9fafb", // bg-gray-50
                            whiteSpace: "nowrap",
                            fontSize: "0.75rem",
                            letterSpacing: "0.04em",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {convertedData.map((item, idx) => (
                      <tr
                        key={idx}
                        style={{
                          transition: "background 0.15s",
                          cursor: "pointer",
                        }}
                        onMouseOver={(e) =>
                          ((
                            e.currentTarget as HTMLTableRowElement
                          ).style.background = "#eff6ff")
                        }
                        onMouseOut={(e) =>
                          ((
                            e.currentTarget as HTMLTableRowElement
                          ).style.background = "#fff")
                        }
                      >
                        {TARGET_HEADERS.map((h) => (
                          <td
                            key={h}
                            style={{
                              padding: "0.5rem 0.5rem",
                              borderBottom: "1px solid #f3f4f6",
                              color: "#1f2937", // text-gray-800
                              whiteSpace: "nowrap",
                              fontSize: "0.85em",
                              maxWidth: 120,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {item[h] || ""}
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
      </div>
    </PageLayout>
  );
}
