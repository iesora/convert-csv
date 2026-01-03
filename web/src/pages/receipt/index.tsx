import React, { useState, useRef } from "react";
import {
  CameraOutlined,
  UploadOutlined,
  FileTextOutlined,
  CheckOutlined,
  ExclamationCircleOutlined,
  DeleteOutlined,
  PlusOutlined,
  DownloadOutlined,
  TableOutlined,
} from "@ant-design/icons";
import {
  Card,
  Button,
  Input,
  Select,
  Table as AntTable,
  Space,
  Spin,
  Alert,
  message,
  Typography,
  Row,
  Col,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import PageLayout from "@/components/common/PageLayout";

const { Title, Text } = Typography;

interface FilePreview {
  file: File;
  url: string;
  id: string;
  isPdf: boolean;
}

interface Expense {
  id: string;
  date: string;
  payee: string;
  amount: number | string;
  taxRate: string;
  taxType: string;
  accountTitle: string;
  summary: string;
  subAccount: string;
  department: string;
}

interface GenerativePart {
  inlineData: {
    data: string;
    mimeType: string;
  };
}

function ReceiptPage() {
  const [files, setFiles] = useState<FilePreview[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  // Gemini API Key (環境変数から取得)
  const apiKey = "AIzaSyDeMxQphuYyuz_rlKB4KhT-xTnCg4AZpYI";

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      processFiles(selectedFiles);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      processFiles(droppedFiles);
    }
  };

  const processFiles = async (newFiles: File[]) => {
    setLoading(true);
    setError("");
    setStatusMessage(`${newFiles.length}件のファイルを読み込んでいます...`);

    // Add files to preview
    const filePreviews: FilePreview[] = newFiles.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9),
      isPdf: file.type === "application/pdf",
    }));

    setFiles((prev) => [...prev, ...filePreviews]);

    try {
      const base64Images = await Promise.all(
        newFiles.map(fileToGenerativePart)
      );

      // Gemini API Call
      const result = await callGeminiAPI(base64Images);

      if (result) {
        // IDを付与してステートに追加
        const newExpenses: Expense[] = result.map((item) => ({
          ...item,
          id: Math.random().toString(36).substr(2, 9),
          // AIが返さない場合のデフォルト値
          taxRate: item.taxRate || "10%",
          taxType: item.taxType || "課税仕入",
          accountTitle: item.accountTitle || "消耗品費",
          summary: item.summary || item.payee || "",
          subAccount: "", // 補助科目（空欄）
          department: "", // 部門（空欄）
        }));

        setExpenses((prev) => [...prev, ...newExpenses]);
        setStatusMessage("読み取り完了！科目を推測しました。");
        message.success("読み取り完了！科目を推測しました。");
      }
    } catch (err: unknown) {
      console.error(err);
      const errorMsg =
        "画像の読み取りに失敗しました。もう一度お試しください。エラー: " +
        (err instanceof Error ? err.message : "Unknown error");
      setError(errorMsg);
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const fileToGenerativePart = (file: File): Promise<GenerativePart> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const base64String = result.split(",")[1];
        resolve({
          inlineData: {
            data: base64String,
            mimeType: file.type,
          },
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const callGeminiAPI = async (
    imageParts: GenerativePart[]
  ): Promise<Expense[]> => {
    if (!apiKey) {
      throw new Error(
        "Gemini API Keyが設定されていません。環境変数NEXT_PUBLIC_GEMINI_API_KEYを設定してください。"
      );
    }

    const prompt = `
      あなたは経理担当のアシスタントです。アップロードされた複数のレシート（画像またはPDF）を解析し、会計ソフト取り込み用のデータを抽出・推測してください。
      
      各レシートについて以下の項目を出力してください:
      1. date: 取引日 (YYYY/MM/DD形式)
      2. payee: 支払先 (店舗名)
      3. amount: 金額 (数値のみ)
      4. taxRate: 消費税率 ("10%" または "8%" または "0%")。品目から推測してください。
      5. taxType: 消費税区分 ("課税仕入" または "非課税" または "不課税")。
      6. accountTitle: 勘定科目 (例: 旅費交通費, 会議費, 消耗品費, 交際費, 新聞図書費, 通信費 など内容から適切に推測)。
      7. summary: 摘要 (具体的な品目や内容のメモ)。
      
      結果は以下のJSONフォーマットの配列のみを返してください。マークダウンや追加のテキストは不要です。
      
      [
        {
          "date": "2023/10/31",
          "payee": "セブンイレブン",
          "amount": 1100,
          "taxRate": "10%",
          "taxType": "課税仕入",
          "accountTitle": "消耗品費",
          "summary": "ボールペン、ノート"
        },
        ...
      ]
    `;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
    const payload = {
      contents: [
        {
          parts: [{ text: prompt }, ...imageParts],
        },
      ],
      generationConfig: {
        temperature: 0.4,
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
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const text = data.candidates[0].content.parts[0].text;

      // Clean up the response
      const jsonStr = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      return JSON.parse(jsonStr);
    } catch (error) {
      throw error;
    }
  };

  const handleExpenseChange = (
    id: string,
    field: keyof Expense,
    value: string | number
  ) => {
    setExpenses((prev) =>
      prev.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp))
    );
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((exp) => exp.id !== id));
  };

  const handleAddRow = () => {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, "/");
    setExpenses((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substr(2, 9),
        date: today,
        payee: "",
        amount: 0,
        taxRate: "10%",
        taxType: "課税仕入",
        accountTitle: "消耗品費",
        summary: "",
        subAccount: "",
        department: "",
      },
    ]);
  };

  const copyToClipboard = () => {
    // 画面表示項目のタブ区切りコピー
    const header = "取引日\t支払先\t金額\t勘定科目\t税率\t区分\t摘要";
    const rows = expenses
      .map(
        (e) =>
          `${e.date}\t${e.payee}\t${e.amount}\t${e.accountTitle}\t${e.taxRate}\t${e.taxType}\t${e.summary}`
      )
      .join("\n");
    const text = `${header}\n${rows}`;

    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand("copy");
      setStatusMessage("クリップボードにコピーしました！");
      message.success("クリップボードにコピーしました！");
      setTimeout(() => setStatusMessage(""), 3000);
    } catch {
      setError("コピーに失敗しました。");
      message.error("コピーに失敗しました。");
    }
    document.body.removeChild(textarea);
  };

  const handleOpenSpreadsheet = () => {
    // 1. クリップボードにコピー
    copyToClipboard();

    // 2. メッセージを更新
    setStatusMessage(
      "コピーしました！開いたスプレッドシートに貼り付けてください (Ctrl+V)"
    );

    // 3. 新しいスプレッドシートを開く (ブラウザのポップアップブロックに注意)
    setTimeout(() => {
      window.open("https://sheets.new", "_blank");
    }, 800);
  };

  const exportToCSV = () => {
    // 今日の日付を取得 (YYYY/MM/DD)
    const today = new Date().toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

    // 指定フォーマットのCSV
    // 列: 取込日, 取引日, 支払先, 金額, 消費税率, 消費税区分, 勘定科目, 補助科目, 部門, 摘要
    const header =
      "取込日,取引日,支払先,金額,消費税率,消費税区分,勘定科目,補助科目,部門,摘要\n";

    const rows = expenses
      .map((e) => {
        // エスケープ処理: 値に含まれるダブルクォートを2つに置換し、全体をダブルクォートで囲む
        const escape = (val: string | number) =>
          `"${String(val || "").replace(/"/g, '""')}"`;
        return [
          escape(today), // 取込日
          escape(e.date), // 取引日
          escape(e.payee), // 支払先
          e.amount, // 金額 (数値のみ推奨だがCSVなのでそのまま。カンマなしは保証)
          escape(e.taxRate), // 消費税率
          escape(e.taxType), // 消費税区分
          escape(e.accountTitle), // 勘定科目
          escape(e.subAccount), // 補助科目 (空欄)
          escape(e.department), // 部門 (空欄)
          escape(e.summary), // 摘要
        ].join(",");
      })
      .join("\n");

    const csvContent = "\uFEFF" + header + rows; // BOM付き
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `expenses_${today.replace(/\//g, "")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setStatusMessage("CSVファイルをダウンロードしました。");
    message.success("CSVファイルをダウンロードしました。");
    setTimeout(() => setStatusMessage(""), 3000);
  };

  const getTotalAmount = () => {
    return expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  };

  const columns: ColumnsType<Expense> = [
    {
      title: "取引日",
      dataIndex: "date",
      key: "date",
      width: 120,
      render: (_, record) => (
        <Input
          value={record.date}
          onChange={(e) =>
            handleExpenseChange(record.id, "date", e.target.value)
          }
          style={{ border: "none", padding: "4px 8px" }}
        />
      ),
    },
    {
      title: "支払先",
      dataIndex: "payee",
      key: "payee",
      width: 150,
      render: (_, record) => (
        <Input
          value={record.payee}
          onChange={(e) =>
            handleExpenseChange(record.id, "payee", e.target.value)
          }
          style={{ border: "none", padding: "4px 8px" }}
        />
      ),
    },
    {
      title: "金額",
      dataIndex: "amount",
      key: "amount",
      width: 100,
      render: (_, record) => (
        <Input
          type="number"
          value={record.amount}
          onChange={(e) =>
            handleExpenseChange(
              record.id,
              "amount",
              Number(e.target.value) || 0
            )
          }
          style={{ border: "none", padding: "4px 8px", textAlign: "right" }}
        />
      ),
    },
    {
      title: "勘定科目",
      dataIndex: "accountTitle",
      key: "accountTitle",
      width: 120,
      render: (_, record) => (
        <Input
          value={record.accountTitle}
          onChange={(e) =>
            handleExpenseChange(record.id, "accountTitle", e.target.value)
          }
          list="accountTitles"
          style={{ border: "none", padding: "4px 8px" }}
        />
      ),
    },
    {
      title: "税率",
      dataIndex: "taxRate",
      key: "taxRate",
      width: 80,
      render: (_, record) => (
        <Select
          value={record.taxRate}
          onChange={(value) => handleExpenseChange(record.id, "taxRate", value)}
          style={{ width: "100%", border: "none" }}
          options={[
            { value: "10%", label: "10%" },
            { value: "8%", label: "8%" },
            { value: "0%", label: "0%" },
          ]}
        />
      ),
    },
    {
      title: "税区分",
      dataIndex: "taxType",
      key: "taxType",
      width: 100,
      render: (_, record) => (
        <Select
          value={record.taxType}
          onChange={(value) => handleExpenseChange(record.id, "taxType", value)}
          style={{ width: "100%", border: "none" }}
          options={[
            { value: "課税仕入", label: "課税仕入" },
            { value: "非課税", label: "非課税" },
            { value: "不課税", label: "不課税" },
          ]}
        />
      ),
    },
    {
      title: "摘要",
      dataIndex: "summary",
      key: "summary",
      render: (_, record) => (
        <Input
          value={record.summary}
          onChange={(e) =>
            handleExpenseChange(record.id, "summary", e.target.value)
          }
          style={{ border: "none", padding: "4px 8px" }}
        />
      ),
    },
    {
      title: "",
      key: "action",
      width: 50,
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteExpense(record.id)}
          size="small"
        />
      ),
    },
  ];

  return (
    <PageLayout>
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#f5f5f5",
          padding: "16px",
          fontFamily:
            "'游ゴシック体', YuGothic, '游ゴシック', 'Yu Gothic', sans-serif",
        }}
      >
        <div style={{ maxWidth: "95%", margin: "0 auto" }}>
          {/* Header */}
          <Card
            style={{
              marginBottom: "24px",
              borderRadius: "12px",
              boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
            }}
          >
            <Row justify="space-between" align="middle">
              <Col>
                <Space size="middle">
                  <div
                    style={{
                      backgroundColor: "#1890ff",
                      padding: "8px",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <CameraOutlined
                      style={{ fontSize: "24px", color: "white" }}
                    />
                  </div>
                  <div>
                    <Title level={4} style={{ margin: 0 }}>
                      レシート読み取り
                    </Title>
                    <Text type="secondary">
                      レシートから勘定科目・税率も自動推測
                    </Text>
                  </div>
                </Space>
              </Col>
              <Col>
                <div style={{ textAlign: "right" }}>
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    合計金額
                  </Text>
                  <div
                    style={{
                      fontSize: "24px",
                      fontWeight: "bold",
                      color: "#1890ff",
                    }}
                  >
                    ¥{getTotalAmount().toLocaleString()}
                  </div>
                </div>
              </Col>
            </Row>
          </Card>

          {/* Upload Area */}
          <Card
            style={{
              marginBottom: "24px",
              borderRadius: "12px",
              cursor: loading ? "not-allowed" : "pointer",
              border: "2px dashed",
              borderColor: loading ? "#d9d9d9" : "#1890ff",
              backgroundColor: loading ? "#fafafa" : "white",
              transition: "all 0.3s",
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => !loading && fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              accept="image/*,application/pdf"
              multiple
              onChange={handleFileSelect}
            />

            {loading ? (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <Spin size="large" />
                <div style={{ marginTop: "16px" }}>
                  <Text strong>AIがレシートを解析中...</Text>
                  <div style={{ marginTop: "8px" }}>
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      日付・金額・勘定科目・税区分を推測しています
                    </Text>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <div
                  style={{
                    backgroundColor: "#e6f7ff",
                    padding: "16px",
                    borderRadius: "50%",
                    display: "inline-flex",
                    marginBottom: "16px",
                  }}
                >
                  <UploadOutlined
                    style={{ fontSize: "32px", color: "#1890ff" }}
                  />
                </div>
                <div>
                  <Text strong style={{ fontSize: "16px" }}>
                    レシート画像・PDFをここにドロップ
                  </Text>
                  <div style={{ marginTop: "8px" }}>
                    <Text type="secondary">
                      またはクリックしてファイルを選択（複数可）
                    </Text>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Status Messages */}
          {error && (
            <Alert
              message={error}
              type="error"
              icon={<ExclamationCircleOutlined />}
              closable
              onClose={() => setError("")}
              style={{ marginBottom: "16px" }}
            />
          )}

          {statusMessage && !error && (
            <Alert
              message={statusMessage}
              type="success"
              icon={<CheckOutlined />}
              closable
              onClose={() => setStatusMessage("")}
              style={{ marginBottom: "16px" }}
            />
          )}

          {/* Main Content: Table & Preview */}
          {expenses.length > 0 && (
            <Row gutter={24}>
              {/* Left: Data Table */}
              <Col xs={24} lg={18}>
                <Card
                  style={{
                    borderRadius: "12px",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                  }}
                  title={
                    <Space>
                      <FileTextOutlined />
                      <Text strong>読み取り結果 (編集可能)</Text>
                    </Space>
                  }
                  extra={
                    <Space>
                      <Button icon={<PlusOutlined />} onClick={handleAddRow}>
                        行追加
                      </Button>
                      <Button
                        type="primary"
                        icon={<TableOutlined />}
                        onClick={handleOpenSpreadsheet}
                        style={{
                          backgroundColor: "#52c41a",
                          borderColor: "#52c41a",
                        }}
                      >
                        スプシに転記
                      </Button>
                      <Button
                        type="primary"
                        icon={<DownloadOutlined />}
                        onClick={exportToCSV}
                      >
                        CSV保存
                      </Button>
                    </Space>
                  }
                >
                  <AntTable
                    columns={columns}
                    dataSource={expenses}
                    rowKey="id"
                    pagination={false}
                    scroll={{ x: "max-content" }}
                    size="small"
                  />
                  <datalist id="accountTitles">
                    <option value="旅費交通費" />
                    <option value="消耗品費" />
                    <option value="会議費" />
                    <option value="交際費" />
                    <option value="通信費" />
                    <option value="新聞図書費" />
                    <option value="雑費" />
                  </datalist>
                </Card>
              </Col>

              {/* Right: Image Preview */}
              <Col xs={24} lg={6}>
                <Card
                  title={
                    <Text
                      strong
                      style={{ fontSize: "12px", textTransform: "uppercase" }}
                    >
                      ファイル一覧
                    </Text>
                  }
                  style={{
                    borderRadius: "12px",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                    position: "sticky",
                    top: "24px",
                  }}
                >
                  <Space
                    direction="vertical"
                    style={{ width: "100%" }}
                    size="small"
                  >
                    {files.map((file) => (
                      <div
                        key={file.id}
                        style={{
                          position: "relative",
                          aspectRatio: "3/4",
                          borderRadius: "8px",
                          overflow: "hidden",
                          border: "1px solid #d9d9d9",
                          backgroundColor: "#fafafa",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {file.isPdf ? (
                          <div style={{ textAlign: "center", padding: "16px" }}>
                            <FileTextOutlined
                              style={{ fontSize: "48px", color: "#ff4d4f" }}
                            />
                            <div
                              style={{
                                marginTop: "8px",
                                fontSize: "12px",
                                fontWeight: "bold",
                                color: "#666",
                                backgroundColor: "white",
                                padding: "4px 8px",
                                borderRadius: "4px",
                                display: "inline-block",
                              }}
                            >
                              PDF
                            </div>
                            <div
                              style={{
                                fontSize: "10px",
                                color: "#999",
                                marginTop: "4px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                width: "100%",
                              }}
                            >
                              {file.file.name}
                            </div>
                          </div>
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={file.url}
                            alt="Receipt"
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        )}
                      </div>
                    ))}
                  </Space>
                </Card>
              </Col>
            </Row>
          )}
        </div>
      </div>
    </PageLayout>
  );
}

export default ReceiptPage;
