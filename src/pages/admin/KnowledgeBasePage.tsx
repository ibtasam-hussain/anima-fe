import React, { useState } from "react";
import {
  Upload as UploadIcon,
  MoreVertical,
  ChevronDown,
  ChevronRight,
  FileVideo,
  Trash2,
  FileAudio2,
  FileText,
  FileArchive,
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
  Modal,
  Input,
  Form,
  Button,
  Space,
  Upload,
  Select,
  Spin,
} from "antd";
import axios from "axios";

const { Option } = Select;

/* ----------------------------------------------
   ✅ FILE TYPE → ICON
------------------------------------------------*/
const getFileIcon = (name: string) => {
  if (name.endsWith(".mp4")) return <FileVideo className="h-4 w-4 text-gray-400" />;
  if (name.endsWith(".mp3") || name.endsWith(".wav") || name.endsWith(".ogg"))
    return <FileAudio2 className="h-4 w-4 text-gray-400" />;
  if (name.endsWith(".pdf") || name.endsWith(".txt"))
    return <FileText className="h-4 w-4 text-gray-400" />;
  if (name.endsWith(".zip")) return <FileArchive className="h-4 w-4 text-gray-400" />;
  return <FileText className="h-4 w-4 text-gray-400" />;
};

interface SubChild {
  id: number;
  name: string;
}

interface Child {
  id: number;
  name: string;
  subchildren?: SubChild[];
}

interface FileItem {
  id: number;
  name: string;
  type: string;
  children?: Child[];
}

const KnowledgeBasePage: React.FC = () => {
  /* ----------------------------------------------
     ✅ Dummy Data
  ------------------------------------------------*/
  const [files, setFiles] = useState<FileItem[]>(
    Array.from({ length: 10 }, (_, i) => {
      const moduleId = i + 1;
      return {
        id: moduleId,
        name: `Module ${moduleId}`,
        type: "Folder",
        children: [
          {
            id: moduleId * 100 + 1,
            name: "Videos",
            subchildren: Array.from({ length: 5 }, (_, j) => ({
              id: moduleId * 1000 + j + 1,
              name: `Video_${j + 1}.mp4`,
            })),
          },
          {
            id: moduleId * 100 + 2,
            name: "Guest Training",
            subchildren: Array.from({ length: 5 }, (_, j) => ({
              id: moduleId * 2000 + j + 1,
              name: `Training_${j + 1}.mp4`,
            })),
          },
          {
            id: moduleId * 100 + 3,
            name: "Slides",
            subchildren: Array.from({ length: 5 }, (_, j) => ({
              id: moduleId * 3000 + j + 1,
              name: `Slide_${j + 1}.pdf`,
            })),
          },
          {
            id: moduleId * 100 + 4,
            name: "Resources & Tools",
            subchildren: Array.from({ length: 5 }, (_, j) => ({
              id: moduleId * 4000 + j + 1,
              name: `Resource_${j + 1}.zip`,
            })),
          },
        ],
      };
    })
  );

  /* ----------------------------------------------
     ✅ Expand States
  ------------------------------------------------*/
  const [expandedModule, setExpandedModule] = useState<number | null>(null);
  const [expandedChild, setExpandedChild] = useState<number | null>(null);

  const toggleModule = (id: number) =>
    setExpandedModule(expandedModule === id ? null : id);

  const toggleChild = (id: number) =>
    setExpandedChild(expandedChild === id ? null : id);

  /* ----------------------------------------------
     ✅ Upload Modal
  ------------------------------------------------*/
  const [showDropdown, setShowDropdown] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedApi, setSelectedApi] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [form] = Form.useForm();

  const toggleDropdown = () => setShowDropdown((prev) => !prev);

  const handleDelete = (id: number) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    toast.success("Deleted");
  };

  const handleApiCall = (api: string) => {
    setSelectedApi(api);
    form.resetFields();
    setModalVisible(true);
    setShowDropdown(false);
  };

  /* ----------------------------------------------
     ✅ REFRESH UI (dummy)
  ------------------------------------------------*/
  const refreshTable = () => {
    setFiles([...files]);
  };

  /* ----------------------------------------------
     ✅ AUDIO UPLOAD
  ------------------------------------------------*/
  const handleAudioUpload = async () => {
    try {
      const values = form.getFieldsValue();
      if (!values.file?.length)
        return toast.error("Please upload at least 1 audio file");

      setLoading(true);

      for (const f of values.file) {
        const formData = new FormData();
        formData.append("file", f.originFileObj);

        const params = {
          index_name: values.index_name || "lms-transcripts",
          module_name: values.module_name || "Unspecified",
          lesson_name: values.lesson_name || "Unspecified",
          category: values.category || "guest_training_transcripts",
        };

        await axios.post(
          "https://python.biomelc.com/documents/audio/upload",
          formData,
          { params }
        );
      }

      toast.success("Audio Uploaded Successfully");
      setModalVisible(false);
      refreshTable();
    } catch (error) {
      toast.error("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  /* ----------------------------------------------
     ✅ PDF UPLOAD
  ------------------------------------------------*/
  const handlePdfUpload = async () => {
    try {
      const values = form.getFieldsValue();

      if (!values.file?.length)
        return toast.error("Please select at least 1 file");

      setLoading(true);

      for (const f of values.file) {
        const formData = new FormData();
        formData.append("file", f.originFileObj);

        const params = {
          module: values.module || "Unspecified",
          category: values.category || "tools",
          lesson: values.lesson || "Unspecified",
        };

        await axios.post(
          "https://python.biomelc.com/documents/pdf/upload",
          formData,
          { params }
        );
      }

      toast.success("PDF Uploaded Successfully");
      setModalVisible(false);
      refreshTable();
    } catch (error) {
      toast.error("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  /* ----------------------------------------------
     ✅ SUBMIT SWITCH
  ------------------------------------------------*/
  const handleModalSubmit = () => {
    if (selectedApi === "/documents/audio/upload") return handleAudioUpload();
    if (selectedApi === "/documents/pdf/upload") return handlePdfUpload();
  };

  /* ----------------------------------------------
     ✅ UI
  ------------------------------------------------*/
  return (
    <div>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-[20px] font-semibold text-gray-900">
          Knowledge Base
        </h1>

        <div className="relative">
          <button
            onClick={toggleDropdown}
            className="flex items-center gap-2 bg-[#3B68F6] text-white px-4 py-2 rounded-full hover:brightness-110"
          >
            <UploadIcon className="h-4 w-4" /> Upload
            <MoreVertical className="h-4 w-4" />
          </button>

          {showDropdown && (
            <div className="absolute top-full right-0 bg-white shadow-md rounded-lg mt-2 w-52 z-50">
              <ul>
                <li
                  onClick={() => handleApiCall("/documents/audio/upload")}
                  className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                >
                  Upload Audio
                </li>
                <li
                  onClick={() => handleApiCall("/documents/pdf/upload")}
                  className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                >
                  Upload PDF
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* TABLE */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-5 py-3">File</th>
              <th className="px-5 py-3">Type</th>
              <th className="px-5 py-3 text-right">Action</th>
            </tr>
          </thead>

          <tbody>
            {files.map((module) => (
              <React.Fragment key={module.id}>
                {/* LEVEL-1: Modules */}
                <tr
                  className="border-t hover:bg-gray-50 cursor-pointer"
                  onClick={() => toggleModule(module.id)}
                >
                  <td className="px-5 py-3 flex items-center gap-2">
                    {expandedModule === module.id ? (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-500" />
                    )}
                    <FileVideo className="h-4 w-4 text-gray-500" />
                    <span>{module.name}</span>
                  </td>
                  <td className="px-5 py-3">{module.type}</td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(module.id);
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>

                {/* LEVEL-2 CHILDREN */}
                {expandedModule === module.id &&
                  module.children?.map((child) => (
                    <React.Fragment key={child.id}>
                      <tr
                        className="border-t bg-gray-50 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleChild(child.id);
                        }}
                      >
                        <td className="px-10 py-2 flex items-center gap-2">
                          {expandedChild === child.id ? (
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          )}
                          <FileVideo className="h-4 w-4 text-gray-400" />
                          {child.name}
                        </td>
                        <td className="px-5 py-2 text-gray-500">Folder</td>
                        <td className="px-5 py-2 text-right"></td>
                      </tr>

                      {/* LEVEL-3 FILES */}
                      {expandedChild === child.id &&
                        child.subchildren?.map((sub) => (
                          <tr key={sub.id} className="border-t bg-gray-100">
                            <td
                              className="py-2 flex items-center gap-2 text-gray-700"
                              style={{ paddingLeft: "80px" }}
                            >
                              {getFileIcon(sub.name)}
                              {sub.name}
                            </td>
                            <td className="px-5 py-2 text-gray-400">File</td>
                            <td className="px-5 py-2 text-right">
                              <button
                                onClick={() =>
                                  toast.success(`Opened ${sub.name}`)
                                }
                                className="text-blue-600 hover:text-blue-800 text-xs"
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                    </React.Fragment>
                  ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      <Modal
        title="Upload Document"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={520}
      >
        <Spin spinning={loading}>
          <Form form={form} layout="vertical" onFinish={handleModalSubmit}>
            {/* AUDIO */}
            {selectedApi === "/documents/audio/upload" && (
              <>
                <Form.Item
                  name="index_name"
                  label="Index Name"
                  initialValue="lms-transcripts"
                >
                  <Input />
                </Form.Item>

                <Form.Item
                  name="module_name"
                  label="Module Name"
                  initialValue="Unspecified"
                >
                  <Input />
                </Form.Item>

                <Form.Item
                  name="lesson_name"
                  label="Lesson Name"
                  initialValue="Unspecified"
                >
                  <Input />
                </Form.Item>

                <Form.Item
                  name="category"
                  label="Category"
                  initialValue="guest_training_transcripts"
                >
                  <Select>
                    <Option value="guest_training_transcripts">
                      guest_training_transcripts
                    </Option>
                    <Option value="transcrips">transcrips</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="file"
                  label="Audio Files"
                  valuePropName="fileList"
                  getValueFromEvent={(e) => e.fileList}
                  rules={[{ required: true, message: "Upload audio files" }]}
                >
                  <Upload beforeUpload={() => false} multiple>
                    <Button>Select Audio</Button>
                  </Upload>
                </Form.Item>
              </>
            )}

            {/* PDF */}
            {selectedApi === "/documents/pdf/upload" && (
              <>
                <Form.Item
                  name="module"
                  label="Module"
                  initialValue="Unspecified"
                >
                  <Input />
                </Form.Item>

                <Form.Item
                  name="category"
                  label="Category"
                  initialValue="tools"
                >
                  <Select>
                    <Option value="tools">tools</Option>
                    <Option value="slides">slides</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="lesson"
                  label="Lesson"
                  initialValue="Unspecified"
                >
                  <Input />
                </Form.Item>

                <Form.Item
                  name="file"
                  label="Files"
                  valuePropName="fileList"
                  getValueFromEvent={(e) => e.fileList}
                  rules={[{ required: true, message: "Upload files" }]}
                >
                  <Upload beforeUpload={() => false} multiple>
                    <Button>Select Files</Button>
                  </Upload>
                </Form.Item>
              </>
            )}

            <Form.Item className="mt-4">
              <Space style={{ width: "100%", justifyContent: "flex-end" }}>
                <Button onClick={() => setModalVisible(false)}>Cancel</Button>
                <Button type="primary" htmlType="submit">
                  Submit
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
    </div>
  );
};

export default KnowledgeBasePage;
