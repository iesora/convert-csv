import React, { useCallback, useRef, useState } from "react";
import PageLayout from "@/components/common/PageLayout";
import Encoding from "encoding-japanese";

type ConvertedRow = string[];

const TARGET_HEADER_LIST = [
  "資産コード",
  "分割コード",
  "資産種類コード",
  "資産種類名",
  "償却方法",
  "資本的支出区分",
  "本支店コード",
  "部門コード",
  "申告先地域コード",
  "決算書連動先",
  "資産名称",
  "構造名",
  "細目名",
  "取得年月日",
  "供用年月日",
  "数量",
  "単位",
  "耐用年数",
  "耐用年数短縮",
  "耐用年数短縮(保証額未満)[圧縮記帳(引当金・積立金)の場合の償却額計算用]",
  "耐用年数(地方税計算用)",
  "償却率",
  "経過措置",
  "経過リース期間定額法を適用する",
  "経過リース期間定額法を採用した事業年度(開始)",
  "経過リース期間定額法を採用した事業年度(終了)",
  "償却期間の月数",
  "取得価額(入力)",
  "取得価額",
  "圧縮記帳の経理方式",
  "圧縮記帳額",
  "期首圧縮記帳引当金残高",
  "引当金期中取崩額",
  "差引取得価額",
  "残存価額 率",
  "残存価額(入力)",
  "残存価額",
  "残存価額(入力)[圧縮記帳(引当金・積立金)の場合の償却額計算用]",
  "残存価額[圧縮記帳(引当金・積立金)の場合の償却額計算用]",
  "償却可能限度額 率",
  "償却可能限度額(入力)",
  "償却可能限度額",
  "償却可能限度額(入力)[圧縮記帳(引当金・積立金)の場合の償却額計算用]",
  "償却可能限度額[圧縮記帳(引当金・積立金)の場合の償却額計算用]",
  "償却月数(入力)",
  "償却月数",
  "相続合併(入力フラグ)",
  "期首帳簿価額",
  "期首帳簿価額(償却方法変更・耐用年数短縮・定率法経過措置用)",
  "期首帳簿価額(〃)[圧縮記帳(引当金・積立金)の場合の償却額計算用]",
  "残存簿価(入力)",
  "残存簿価",
  "改定取得価額(入力)",
  "改定取得価額",
  "改定取得価額(入力)[圧縮記帳(引当金・積立金)の場合の償却額計算用]",
  "改定取得価額[圧縮記帳(引当金・積立金)の場合の償却額計算用]",
  "償却計算の基礎となる額",
  "算出償却額(入力)",
  "算出償却額",
  "期首償却過不足額",
  "増加償却割合",
  "増加償却額(入力)",
  "増加償却額",
  "特別償却区分",
  "適用条項 条",
  "適用条項 項",
  "特別償却割合",
  "特別償却金額(入力)",
  "特別償却金額",
  "経理処理区分",
  "当期償却限度額",
  "当期償却額(入力)",
  "当期償却額",
  "償却過不足額",
  "償却実施率",
  "事業専用割合(分子)",
  "事業専用割合(分母)",
  "除却年月日",
  "除却時の計算方法",
  "除却区分",
  "除売却価額",
  "有姿除却年月日",
  "有姿除却時の計算方法",
  "有姿除却 処分見込価額",
  "有姿除却(処分)年月日",
  "前期除却区分",
  "期末帳簿価額",
  "期末引当金額",
  "償却累計額",
  "販売管理費 分子",
  "販売管理費 分母",
  "販売管理費",
  "製造原価 分子",
  "製造原価 分母",
  "製造原価",
  "営業外費用 分子",
  "営業外費用 分母",
  "営業外費用",
  "償却資産種類",
  "地域移動",
  "地域移動 地域コード(前回)",
  "償却資産資産コード(入力)",
  "償却資産資産コード",
  "償却資産用取得価額 入力フラグ",
  "償却資産用取得価額 手入力",
  "種類別明細書取得年月日(入力)",
  "種類別明細書取得年月日",
  "取得年月(入力)",
  "取得年月(元号)",
  "取得年月(年月)",
  "摘要全資産等(1)",
  "摘要全資産等(2)",
  "摘要減少(1)",
  "摘要減少(2)",
  "前回申告未実施",
  "前回の評価額(入力)",
  "前回の評価額",
  "今回の評価額(入力)",
  "今回の評価額",
  "課税標準の特例(分子)",
  "課税標準の特例(分母)",
  "特例の適用終了年度",
  "増加事由(入力)",
  "増加事由",
  "減少事由(入力)",
  "減少事由",
  "減少区分(入力)",
  "減少区分",
  "当期減損処理設定",
  "減損年月日(当期)",
  "減損損失計上(当期)",
  "減損前帳簿価額(当期)(入力)",
  "減損前帳簿価額(当期)",
  "減損損失額(当期)",
  "減損後帳簿価額(当期)",
  "減損後耐用年数(当期)(入力)",
  "減損後耐用年数(当期)",
  "減損後償却率(当期)(入力)",
  "減損後償却率 (当期)",
  "減損後残存価額(当期)(入力)",
  "減損後残存価額(当期)",
  "減損損失累計額(当期)",
  "過年度減損処理設定",
  "最終減損年月日(過年度)",
  "減損損失計上(過年度)",
  "減損後帳簿価額(過年度)",
  "減損損失累計額(過年度)",
  "減損後耐用年数(過年度)",
  "減損後償却率(過年度)(入力)",
  "減損後償却率 (過年度)",
  "減損後残存価額(過年度)(入力)",
  "減損後残存価額(過年度)",
  "減損後改定取得価額(過年度)",
  "計算の基礎となる額(過年度)(入力)",
  "計算の基礎となる額(過年度)",
  "資産グループコード",
  "経過措置(減損用)",
  "耐用年数短縮(減損用)",
  "計算用の帳簿価額",
  "計算用の耐用年数",
  "メモ欄上段",
  "メモ欄中段",
  "メモ欄下段",
  "資産除去債務を計上する",
  "計上年月日",
  "除去債務_耐用年数(入力)",
  "除去債務_耐用年数",
  "見積額",
  "見積期末調整額",
  "割引率",
  "資産除去債務(入力)",
  "資産除去債務",
  "期首資産除去債務額",
  "利息費用(入力)",
  "利息費用",
  "利息費用 端数処理",
  "除去債務期末調整額",
  "過年度除去債務調整あり",
  "資産除去債務履行費用",
  "除去債務_取得価額(入力)",
  "除去債務_取得価額",
  "除去債務_残存価額(入力)",
  "除去債務_残存価額",
  "除去債務_改定取得価額(入力)",
  "除去債務_改定取得価額",
  "変更した事業年度開始の日における帳簿価額",
  "除去債務_期首帳簿価額",
  "除去債務_当期償却額(入力)",
  "除去債務_当期償却額",
  "簿価期末調整額",
  "割引現在価値 端数処理１",
  "割引現在価値 端数処理２",
  "備考上段",
  "備考下段",
  "稼働状態(No.1)",
  "稼働状態(No.2)",
  "稼働状態(No.3)",
  "稼働状態(No.4)",
  "稼働状態(No.5)",
  "稼働状態(No.6)",
  "稼働状態(No.7)",
  "稼働状態(No.8)",
  "稼働状態(No.9)",
  "稼働状態(No.10)",
  "稼働状態(No.11)",
  "稼働状態(No.12)",
  "稼働状態(翌期首)",
  "当期償却額の計上",
  "月次端数処理",
  "月次端数計算",
  "遊休月端数",
  "資産コード(リース資産)",
  "分割コード(リース資産)",
  "資産種類コード(リース資産)",
  "資産種類名(リース資産)",
  "資産名称(リース資産)",
  "リース資産区分",
  "契約番号",
  "数量(リース資産)",
  "単位(リース資産)",
  "支払間隔",
  "支払回数",
  "支払区分",
  "契約開始日",
  "契約終了日",
  "支払開始日",
  "消費税控除",
  "利息区分",
  "未経過リース料集計区分",
  "支払リース料",
  "外 消費税(支払リース料)",
  "支払リース料総額(入力)",
  "支払リース料総額",
  "外 消費税(支払リース料総額)(入力)",
  "外 消費税(支払リース料総額)",
  "残価保証額",
  "割引率(リース資産)",
  "現在価値",
  "計上価額(入力)",
  "計上価額",
  "期首支払済回数",
  "期首支払リース料残高",
  "外 消費税(期首支払リース料残高)",
  "期首元本相当額",
  "期首消費税債務",
  "当期支払リース料",
  "外 消費税(当期支払リース料)",
  "年利子率(入力)",
  "年利子率",
  "当期利息相当額",
  "消費税債務減少額",
  "解約年月日",
  "割引現在価値 端数処理１(リース資産)",
  "割引現在価値 端数処理２(リース資産)",
  "本支店コード(リース資産)",
  "部門コード(リース資産)",
  "備考１",
  "備考２",
  "備考３",
  "当期支払リース料内訳　入力チェック(1)",
  "当期支払リース料内訳　支払リース料(1)",
  "当期支払リース料内訳　外 消費税(支払リース料)(1)",
  "当期支払リース料内訳　元本返済相当額(1)",
  "当期支払リース料内訳　消費税債務(1)",
  "当期支払リース料内訳　入力チェック(2)",
  "当期支払リース料内訳　支払リース料(2)",
  "当期支払リース料内訳　外 消費税(支払リース料)(2)",
  "当期支払リース料内訳　元本返済相当額(2)",
  "当期支払リース料内訳　消費税債務(2)",
  "当期支払リース料内訳　入力チェック(3)",
  "当期支払リース料内訳　支払リース料(3)",
  "当期支払リース料内訳　外 消費税(支払リース料)(3)",
  "当期支払リース料内訳　元本返済相当額(3)",
  "当期支払リース料内訳　消費税債務(3)",
  "当期支払リース料内訳　入力チェック(4)",
  "当期支払リース料内訳　支払リース料(4)",
  "当期支払リース料内訳　外 消費税(支払リース料)(4)",
  "当期支払リース料内訳　元本返済相当額(4)",
  "当期支払リース料内訳　消費税債務(4)",
  "当期支払リース料内訳　入力チェック(5)",
  "当期支払リース料内訳　支払リース料(5)",
  "当期支払リース料内訳　外 消費税(支払リース料)(5)",
  "当期支払リース料内訳　元本返済相当額(5)",
  "当期支払リース料内訳　消費税債務(5)",
  "当期支払リース料内訳　入力チェック(6)",
  "当期支払リース料内訳　支払リース料(6)",
  "当期支払リース料内訳　外 消費税(支払リース料)(6)",
  "当期支払リース料内訳　元本返済相当額(6)",
  "当期支払リース料内訳　消費税債務(6)",
  "当期支払リース料内訳　入力チェック(7)",
  "当期支払リース料内訳　支払リース料(7)",
  "当期支払リース料内訳　外 消費税(支払リース料)(7)",
  "当期支払リース料内訳　元本返済相当額(7)",
  "当期支払リース料内訳　消費税債務(7)",
  "当期支払リース料内訳　入力チェック(8)",
  "当期支払リース料内訳　支払リース料(8)",
  "当期支払リース料内訳　外 消費税(支払リース料)(8)",
  "当期支払リース料内訳　元本返済相当額(8)",
  "当期支払リース料内訳　消費税債務(8)",
  "当期支払リース料内訳　入力チェック(9)",
  "当期支払リース料内訳　支払リース料(9)",
  "当期支払リース料内訳　外 消費税(支払リース料)(9)",
  "当期支払リース料内訳　元本返済相当額(9)",
  "当期支払リース料内訳　消費税債務(9)",
  "当期支払リース料内訳　入力チェック(10)",
  "当期支払リース料内訳　支払リース料(10)",
  "当期支払リース料内訳　外 消費税(支払リース料)(10)",
  "当期支払リース料内訳　元本返済相当額(10)",
  "当期支払リース料内訳　消費税債務(10)",
  "当期支払リース料内訳　入力チェック(11)",
  "当期支払リース料内訳　支払リース料(11)",
  "当期支払リース料内訳　外 消費税(支払リース料)(11)",
  "当期支払リース料内訳　元本返済相当額(11)",
  "当期支払リース料内訳　消費税債務(11)",
  "当期支払リース料内訳　入力チェック(12)",
  "当期支払リース料内訳　支払リース料(12)",
  "当期支払リース料内訳　外 消費税(支払リース料)(12)",
  "当期支払リース料内訳　元本返済相当額(12)",
  "当期支払リース料内訳　消費税債務(12)",
];

function warekiToYYYYMMDD(str: string): string {
  if (!str) return "";
  const cleanStr = str.replace(/["\s]/g, "");
  const match = cleanStr.match(/(?:令和|令)(\d+)年(\d+)月(\d+)日/);
  if (match) {
    const year = (parseInt(match[1]) + 2018).toString();
    const month = match[2].padStart(2, "0");
    const day = match[3].padStart(2, "0");
    return `${year}${month}${day}`;
  }
  const dateOnly = cleanStr.replace(/[^0-9]/g, "");
  if (dateOnly.length === 8) return dateOnly;
  return cleanStr;
}

function cleanNumber(str: string | undefined | null): string {
  if (str === undefined || str === null || str.trim() === "") return "";
  const cleaned = str.replace(/[^0-9.-]/g, "");
  return cleaned === "" ? "" : cleaned;
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let cur = "";
  let inQuote = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuote && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuote = !inQuote;
      }
    } else if (char === "," && !inQuote) {
      result.push(cur.trim());
      cur = "";
    } else {
      cur += char;
    }
  }
  result.push(cur.trim());
  return result;
}

async function classifyAssetType(assetTypeName: string): Promise<string> {
  const apiKey = "AIzaSyDeMxQphuYyuz_rlKB4KhT-xTnCg4AZpYI";
  if (!apiKey) {
    console.warn(
      "Gemini API Keyが設定されていません。資産種類コードは空のままです。"
    );
    return "";
  }

  const prompt = `
あなたは資産管理の専門家です。与えられた資産種類名を分析し、以下のマッピングに基づいて適切な資産種類コードを返してください。

マッピング:
- 00：建物
- 10：建物附属設備
- 20：構築物
- 30：船舶
- 40：航空機
- 50：車両運搬具
- 60：工具
- 70：器具備品
- 80：機械装置
- 90：生物
- A0：無形固定資産
- B0：フランチャイズ費
- C0：土地
- D0：非償却資産
- E0：創立費
- F0：一括償却資産
- ##：一括償却

資産種類名: "${assetTypeName}"

上記の資産種類名に最も適切な資産種類コードを返してください。コードのみを返してください（例: "00"、"10"、"A0"など）。該当するコードがない場合は空文字列を返してください。
`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
  const payload = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: 0.1,
    },
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(`Gemini API Error: ${response.status}`);
      return "";
    }

    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text.trim();

    // コードのみを抽出（マークダウンや余分なテキストを除去）
    const codeMatch = text.match(/(?:^|\s)([0-9A-F]{2}|##)(?:\s|$)/);
    if (codeMatch) {
      return codeMatch[1];
    }

    // マッチしない場合は、テキストから直接抽出を試みる
    const cleaned = text.replace(/```/g, "").replace(/json/g, "").trim();
    if (cleaned.match(/^[0-9A-F]{2}$|^##$/)) {
      return cleaned;
    }

    return "";
  } catch (error) {
    console.error("資産種類コードの分類中にエラーが発生しました:", error);
    return "";
  }
}

export default function AssetConverterTool() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [status, setStatus] = useState<{
    text: string;
    style: React.CSSProperties;
  } | null>(null);
  const [convertedRows, setConvertedRows] = useState<ConvertedRow[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [clientName, setClientName] = useState<string>("");

  const showMessage = useCallback((msg: string, style: React.CSSProperties) => {
    setStatus({ text: msg, style });
  }, []);

  const showError = useCallback(
    (msg: string) => {
      showMessage(msg, {
        backgroundColor: "#fee2e2",
        color: "#991b1b",
        border: "1px solid #fecaca",
      });
    },
    [showMessage]
  );

  const processContent = useCallback(
    async (content: string) => {
      try {
        showMessage("ファイルを処理中...", {
          backgroundColor: "#dbeafe",
          color: "#1e40af",
        });

        const lines = content.split(/\r?\n/);
        const outputData: ConvertedRow[] = [];
        let assetCounter = 1;

        // B3セル（行2、列1）から顧問先名称を取得
        if (lines.length > 2) {
          const row3 = parseCsvLine(lines[2]);
          if (row3.length > 1) {
            const nameFromB3 = row3[1]?.trim() || "";
            setClientName(nameFromB3);
          }
        }

        // まず全ての明細行を収集
        const detailRows: { cols: string[]; kamoku: string }[] = [];
        lines.forEach((line) => {
          if (!line.trim()) return;
          const cols = parseCsvLine(line);
          if (cols[0] === "[明細行]") {
            const kamoku = cols[3] || "";
            detailRows.push({ cols, kamoku });
          }
        });

        if (detailRows.length === 0) {
          showError("有効なデータが見つかりませんでした。");
          return;
        }

        // 資産種類コードを分類（8行目以下、つまりインデックス7以降のD列）
        showMessage(
          `${detailRows.length}件のデータを処理中... 資産種類コードを分類しています...`,
          {
            backgroundColor: "#dbeafe",
            color: "#1e40af",
          }
        );

        // 各資産種類名を分類
        for (let i = 0; i < detailRows.length; i++) {
          const { cols, kamoku } = detailRows[i];
          const outRow = new Array(TARGET_HEADER_LIST.length).fill(
            ""
          ) as string[];

          const name = cols[9] || "";
          const 取得日 = warekiToYYYYMMDD(cols[12]);
          const 供用日 = warekiToYYYYMMDD(cols[13]);
          const 取得価額 = cleanNumber(cols[23]);
          const 圧縮記帳額 = cleanNumber(cols[24]);
          const 差引取得価額 = cleanNumber(cols[25]);
          const 耐用年数 = cleanNumber(cols[20]);
          const 償却率 = cleanNumber(cols[21]);
          const 償却実施率 = cleanNumber(cols[22]);
          const 数量 = cleanNumber(cols[10]);
          const 単位 = cols[11] || "";

          // 生成されるファイルの8行目以下（データ行）のD列（資産種類名）をGeminiで分類
          // メタヘッダー6行 + ヘッダー行1行 = 7行目まで、8行目以降がデータ行
          // すべてのデータ行に対して資産種類コードを分類
          let assetTypeCode = "";
          if (kamoku) {
            assetTypeCode = await classifyAssetType(kamoku);
          }

          outRow[0] = String(assetCounter++); // 資産コード: 0埋めしない
          outRow[1] = "1"; // 分割コード: 2桁"01"でなく"1"に
          outRow[2] = assetTypeCode; // 資産種類コード: Geminiで分類
          outRow[3] = kamoku;
          outRow[4] = cols[19] === "即時償却" ? "少額資産" : "定額法";
          outRow[10] = name;
          outRow[13] = 取得日;
          outRow[14] = 供用日;
          outRow[15] = 数量;
          outRow[16] = 単位;
          outRow[17] = 耐用年数;
          outRow[21] = 償却率;
          outRow[74] = 償却実施率;
          outRow[27] = 取得価額;
          outRow[28] = 取得価額;
          outRow[30] = 圧縮記帳額;
          outRow[33] = 差引取得価額;

          outputData.push(outRow);
        }

        setConvertedRows(outputData);
        showMessage(`${outputData.length}件のデータを正常に変換しました。`, {
          backgroundColor: "#dcfce7",
          color: "#166534",
        });
        setShowResult(true);
      } catch (err) {
        showError(
          "処理中にエラーが発生しました: " +
            (err instanceof Error ? err.message : String(err))
        );
      }
    },
    [showMessage, showError]
  );

  const handleFile = useCallback(
    async (file: File) => {
      showMessage("ファイルを読み込み中...", {
        backgroundColor: "#dbeafe",
        color: "#1e40af",
      });

      const reader = new FileReader();
      reader.onload = async (e) => {
        if (!e.target) return;
        const content = e.target.result as string;
        if (!content.includes("[明細行]")) {
          const utf8Reader = new FileReader();
          utf8Reader.onload = async (ev) => {
            if (!ev.target) return;
            await processContent(ev.target.result as string);
          };
          utf8Reader.readAsText(file, "UTF-8");
        } else {
          await processContent(content);
        }
      };
      reader.readAsText(file, "Shift-JIS");
    },
    [showMessage, processContent]
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
    if (convertedRows.length === 0) return;

    // 顧問先名称が取得されている場合はそれを使用、なければデフォルト値
    const clientNameValue = clientName || "株式会社二垣経営研究所";
    const clientNameLine = `顧問先名称=${clientNameValue}`;

    // 顧問先名称に「株式会社」「有限会社」「合同会社」が含まれている場合は法人、それ以外は個人
    const isCorporation =
      clientNameValue.includes("株式会社") ||
      clientNameValue.includes("有限会社") ||
      clientNameValue.includes("合同会社");
    const corporateTypeLine = `法人個人区分=${isCorporation ? "法人" : "個人"}`;

    const metaHeader = [
      "バージョン=1.9.0.10(FILEVERSION=1.13)",
      "顧問先コード=",
      clientNameLine,
      corporateTypeLine,
      "事業年度開始日=",
      "事業年度終了日=",
    ];

    const headerRow = ";" + TARGET_HEADER_LIST.join(",");
    const bodyRows = convertedRows.map((row) =>
      row.map((v) => `"${v}"`).join(",")
    );
    const fullContent =
      metaHeader.join("\r\n") +
      "\r\n" +
      headerRow +
      "\r\n" +
      bodyRows.join("\r\n");

    // UTF-8文字列をShift_JIS（CP932）に変換
    const sjisResult = Encoding.convert(fullContent, {
      to: "SJIS",
      from: "UNICODE",
      type: "arraybuffer",
    });
    const sjisArray =
      sjisResult instanceof Uint8Array
        ? sjisResult
        : new Uint8Array(sjisResult);

    // ArrayBufferに変換してBlobPartとして使用
    const arrayBuffer = sjisArray.buffer.slice(
      sjisArray.byteOffset,
      sjisArray.byteOffset + sjisArray.byteLength
    ) as ArrayBuffer;

    const blob = new Blob([arrayBuffer], {
      type: "text/csv;charset=shift_jis;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `二垣形式_資産データ_${new Date()
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, "")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [convertedRows, clientName]);

  return (
    <PageLayout>
      <div
        style={{
          backgroundColor: "#f8fafc",
          minHeight: "100vh",
          fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif",
        }}
      >
        <style jsx>{`
          .drop-zone {
            transition: all 0.3s ease;
          }
          .drop-zone.dragover {
            border-color: #3b82f6 !important;
            background-color: #eff6ff !important;
          }
          .table-container {
            max-height: 500px;
            overflow-y: auto;
          }
          thead th {
            position: sticky;
            top: 0;
            z-index: 10;
            background-color: #f8fafc;
          }
          @media (max-width: 768px) {
            .main-container {
              padding-top: 1.5rem !important;
              padding-bottom: 1.5rem !important;
              padding-left: 0.5rem !important;
              padding-right: 0.5rem !important;
            }
            .page-header {
              margin-bottom: 1.5rem !important;
            }
            .page-title {
              font-size: 1.5rem !important;
            }
            .page-description {
              font-size: 0.875rem !important;
            }
            .drop-zone-container {
              padding: 2rem 1rem !important;
            }
            .table-container {
              max-height: 400px;
              overflow-x: auto;
              -webkit-overflow-scrolling: touch;
            }
            .data-table {
              font-size: 9px !important;
            }
            .data-table th,
            .data-table td {
              padding: 0.5rem 0.25rem !important;
              white-space: nowrap;
            }
          }
        `}</style>
        <div
          style={{
            maxWidth: "56rem",
            margin: "0 auto",
            paddingTop: "3rem",
            paddingBottom: "3rem",
            paddingLeft: "1rem",
            paddingRight: "1rem",
          }}
          className="main-container"
        >
          <header
            style={{ textAlign: "center", marginBottom: "2.5rem" }}
            className="page-header"
          >
            <h1
              style={{
                fontSize: "1.875rem",
                fontWeight: 700,
                color: "#1e293b",
                marginBottom: "0.5rem",
              }}
              className="page-title"
            >
              資産データ変換ツール
            </h1>
            <p style={{ color: "#475569" }} className="page-description">
              弥生形式の資産一覧表を、指定のフルフォーマットCSVに変換します
            </p>
          </header>

          <div
            id="dropZone"
            className={`drop-zone drop-zone-container ${
              isDragOver ? "dragover" : ""
            }`}
            style={{
              border: "2px dashed",
              borderColor: isDragOver ? "#3b82f6" : "#cbd5e1",
              borderRadius: "1rem",
              padding: "4rem",
              textAlign: "center",
              backgroundColor: isDragOver ? "#eff6ff" : "#fff",
              cursor: "pointer",
              boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)",
              transition: "all 0.3s ease",
            }}
            onClick={onPickFile}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              style={{ display: "none" }}
              accept=".csv"
              onChange={onInputChange}
            />
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <div style={{ display: "flex", justifyContent: "center" }}>
                <div
                  style={{
                    padding: "1rem",
                    backgroundColor: "#eff6ff",
                    borderRadius: "9999px",
                    transition: "background-color 0.15s",
                  }}
                >
                  <svg
                    style={{
                      height: "2.5rem",
                      width: "2.5rem",
                      color: "#3b82f6",
                    }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </div>
              </div>
              <div>
                <p
                  style={{
                    color: "#334155",
                    fontWeight: 700,
                    fontSize: "1.125rem",
                  }}
                >
                  弥生のCSVファイルをドロップ
                </p>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "#94a3b8",
                    marginTop: "0.25rem",
                  }}
                >
                  「資産一覧表_弥生.csv」を選択してください
                </p>
              </div>
            </div>
          </div>

          {status && (
            <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
              <div
                style={{
                  display: "inline-block",
                  padding: "0.5rem 1rem",
                  borderRadius: "0.5rem",
                  fontSize: "0.875rem",
                  fontWeight: 700,
                  ...status.style,
                }}
              >
                {status.text}
              </div>
            </div>
          )}

          {showResult && (
            <div
              style={{
                marginTop: "2.5rem",
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h2
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 700,
                    color: "#1e293b",
                  }}
                >
                  変換完了
                </h2>
                <button
                  onClick={downloadCsv}
                  style={{
                    backgroundColor: "#2563eb",
                    color: "#fff",
                    padding: "0.75rem 2rem",
                    borderRadius: "0.5rem",
                    fontWeight: 700,
                    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                  onMouseOver={(e) => {
                    (e.target as HTMLButtonElement).style.backgroundColor =
                      "#1d4ed8";
                    (e.target as HTMLButtonElement).style.transform =
                      "translateY(-2px)";
                  }}
                  onMouseOut={(e) => {
                    (e.target as HTMLButtonElement).style.backgroundColor =
                      "#2563eb";
                    (e.target as HTMLButtonElement).style.transform =
                      "translateY(0)";
                  }}
                >
                  指定形式CSVをダウンロード
                </button>
              </div>

              <div
                style={{
                  backgroundColor: "#fff",
                  boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
                  border: "1px solid #e2e8f0",
                  borderRadius: "0.75rem",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    backgroundColor: "#f8fafc",
                    padding: "0.5rem 1rem",
                    borderBottom: "1px solid #e2e8f0",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      color: "#94a3b8",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                    }}
                  >
                    変換済みデータ一覧
                  </h3>
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      color: "#3b82f6",
                      backgroundColor: "#eff6ff",
                      padding: "0.125rem 0.5rem",
                      borderRadius: "0.25rem",
                    }}
                  >
                    {convertedRows.length} items
                  </span>
                </div>
                <div className="table-container">
                  <table
                    style={{
                      minWidth: "100%",
                      borderCollapse: "collapse",
                      fontSize: "10px",
                    }}
                    className="data-table"
                  >
                    <thead style={{ color: "#64748b" }}>
                      <tr>
                        <th
                          style={{
                            padding: "0.75rem 0.5rem",
                            textAlign: "left",
                            fontWeight: 700,
                            boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)",
                          }}
                        >
                          コード
                        </th>
                        <th
                          style={{
                            padding: "0.75rem 0.5rem",
                            textAlign: "left",
                            fontWeight: 700,
                            boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)",
                          }}
                        >
                          資産種類名
                        </th>
                        <th
                          style={{
                            padding: "0.75rem 0.5rem",
                            textAlign: "left",
                            fontWeight: 700,
                            boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)",
                          }}
                        >
                          資産名称
                        </th>
                        <th
                          style={{
                            padding: "0.75rem 0.5rem",
                            textAlign: "right",
                            fontWeight: 700,
                            boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)",
                          }}
                        >
                          取得価額
                        </th>
                      </tr>
                    </thead>
                    <tbody style={{ backgroundColor: "#fff" }}>
                      {convertedRows.map((row, idx) => (
                        <tr
                          key={idx}
                          style={{ transition: "background-color 0.15s" }}
                          onMouseOver={(e) => {
                            (
                              e.currentTarget as HTMLTableRowElement
                            ).style.backgroundColor = "#f8fafc";
                          }}
                          onMouseOut={(e) => {
                            (
                              e.currentTarget as HTMLTableRowElement
                            ).style.backgroundColor = "#fff";
                          }}
                        >
                          <td
                            style={{
                              padding: "0.75rem 0.5rem",
                              borderBottom: "1px solid #f1f5f9",
                              color: "#334155",
                            }}
                          >
                            {row[0] || ""}
                          </td>
                          <td
                            style={{
                              padding: "0.75rem 0.5rem",
                              borderBottom: "1px solid #f1f5f9",
                              color: "#334155",
                            }}
                          >
                            {row[3] || ""}
                          </td>
                          <td
                            style={{
                              padding: "0.75rem 0.5rem",
                              borderBottom: "1px solid #f1f5f9",
                              color: "#334155",
                            }}
                          >
                            {row[10] || ""}
                          </td>
                          <td
                            style={{
                              padding: "0.75rem 0.5rem",
                              borderBottom: "1px solid #f1f5f9",
                              color: "#334155",
                              textAlign: "right",
                              fontFamily: "monospace",
                            }}
                          >
                            {row[28] || ""}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
