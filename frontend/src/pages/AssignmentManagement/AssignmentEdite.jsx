import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Save, 
  Clock, 
  Calendar, 
  FileText, 
  Upload,
  AlertCircle,
  X,
  ArrowLeft
} from "lucide-react";
import Layout from "../../components/layoutes/teacherlayout";
import authAxios, { getUserData } from "../../utils/auth";
import Loader from "../../components/Loader";

const AssignmentUpdateForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const userData = getUserData();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    classId: "",
    subjectId: "",
    dueDate: "",
    dueTime: "23:59",
    totalMarks: 100,
    attachments: [],
    instructions: "",
    isDraft: false
  });

  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [newAttachments, setNewAttachments] = useState([]);
  const [attachmentsToRemove, setAttachmentsToRemove] = useState([]);
  const [teacherTimetables, setTeacherTimetables] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setServerError("");

        // Fetch assignment data and related information
        const [assignmentRes, classesRes, subjectsRes, timetablesRes] = await Promise.all([
          authAxios.get(`assignments/${id}`),
          authAxios.get("classes"),
          authAxios.get("subjects"),
          authAxios.get(`timetables/teacher/class/${userData.id}`)
        ]);

        const assignment = assignmentRes.data.data;
        const allClasses = classesRes.data.data || [];
        const subjectsData = subjectsRes.data.data || [];
        const teacherData = timetablesRes.data.data || [];

        // Parse due date and time
        const dueDateTime = new Date(assignment.dueDate);
        const dueDate = dueDateTime.toISOString().split('T')[0];
        const dueTime = `${dueDateTime.getHours().toString().padStart(2, '0')}:${dueDateTime.getMinutes().toString().padStart(2, '0')}`;

        setFormData({
          title: assignment.title,
          description: assignment.description,
          classId: assignment.classId,
          subjectId: assignment.subjectId,
          dueDate,
          dueTime,
          totalMarks: assignment.totalMarks,
          attachments: assignment.attachments,
          instructions: assignment.instructions,
          isDraft: assignment.isDraft
        });

        // Set related data
        setTeacherTimetables(teacherData);
        setAllSubjects(subjectsData);

        // Filter teacher's classes
        const classIds = new Set(teacherData.map(t => t.class?._id));
        setClasses(allClasses.filter(cls => classIds.has(cls._id)));

        // Set initial subjects
        updateSubjectsForClass(assignment.classId);

      } catch (err) {
        console.error("Failed to load data:", err);
        setServerError("Failed to load assignment data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, userData.id]);

  const updateSubjectsForClass = (classId) => {
    const classSubjects = teacherTimetables
      .filter(t => t.class?._id === classId)
      .flatMap(t => t.periods)
      .map(p => p.subject)
      .filter((s, i, arr) => arr.findIndex(s2 => s2._id === s._id) === i);

    if (classSubjects.length === 0) {
      setSubjects(allSubjects.filter(s => s.class === classId));
    } else {
      setSubjects(classSubjects);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title required";
    if (!formData.classId) newErrors.classId = "Class required";
    if (!formData.subjectId) newErrors.subjectId = "Subject required";
    if (!formData.dueDate) newErrors.dueDate = "Due date required";
    if (!formData.dueTime) newErrors.dueTime = "Due time required";
    if (formData.totalMarks <= 0) newErrors.totalMarks = "Invalid marks";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleFileChange = (e) => {
    setNewAttachments([...newAttachments, ...Array.from(e.target.files)]);
  };

  const removeAttachment = (type, identifier) => {
    if (type === 'existing') {
      setFormData(prev => ({
        ...prev,
        attachments: prev.attachments.filter(a => a._id !== identifier)
      }));
      setAttachmentsToRemove(prev => [...prev, identifier]);
    } else {
      setNewAttachments(prev => prev.filter((_, i) => i !== identifier));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      setServerError("");

      const formDataObj = new FormData();
      const dueDateTime = new Date(`${formData.dueDate}T${formData.dueTime}`);

      // Append core fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'attachments') formDataObj.append(key, value);
      });
      formDataObj.append("dueDate", dueDateTime.toISOString());

      // Append attachments
      newAttachments.forEach(file => formDataObj.append("attachments", file));
      attachmentsToRemove.forEach(id => formDataObj.append("removeAttachments", id));

      // Update assignment
      const response = await authAxios.put(`assignments/${id}`, formDataObj, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (response.status === 200) {
        navigate("/assignments");
      }
    } catch (err) {
      console.error("Update failed:", err);
      setServerError(err.response?.data?.message || "Update failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center py-12">
          <Loader />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
     <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <button
            onClick={() => navigate("/assignments")}
            className="mb-4 inline-flex items-center text-sm text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Assignments
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            Edit Assignment
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Update assignment details
          </p>
        </div>

        {serverError && (
          <div className="mb-6 rounded-md bg-red-50 p-4 text-red-600">
            <div className="flex items-center">
              <AlertCircle className="mr-2 h-5 w-5" />
              {serverError}
            </div>
          </div>
        )}

        <form onSubmit={(e) => handleSubmit(e, false)}>
          <div className="space-y-8">
            {/* Basic Information Section */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-lg font-medium text-gray-900">Basic Information</h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Assignment Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-md border ${
                      errors.title ? "border-red-500" : "border-gray-300"
                    } px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                    placeholder="Enter assignment title"
                  />
                  {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Class <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="classId"
                    value={formData.classId}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-md border ${
                      errors.classId ? "border-red-500" : "border-gray-300"
                    } px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                  >
                    <option value="">Select Class</option>
                    {classes.map((cls) => (
                      <option key={cls._id} value={cls._id}>
                        {cls.name} {cls.section ? `- ${cls.section}` : ''}
                      </option>
                    ))}
                  </select>
                  {errors.classId && <p className="mt-1 text-sm text-red-600">{errors.classId}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="subjectId"
                    value={formData.subjectId}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-md border ${
                      errors.subjectId ? "border-red-500" : "border-gray-300"
                    } px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                    disabled={!formData.classId || subjects.length === 0}
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((subject) => (
                      <option key={subject._id} value={subject._id}>
                        {subject.name}
                      </option>
                    ))}
                    {subjects.length === 0 && formData.classId && (
                      <option value="" disabled>
                        No subjects available for this class
                      </option>
                    )}
                  </select>
                  {errors.subjectId && <p className="mt-1 text-sm text-red-600">{errors.subjectId}</p>}
                </div>
              </div>
            </div>

            {/* Details Section */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-lg font-medium text-gray-900">Details</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Provide a brief description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Instructions
                  </label>
                  <textarea
                    name="instructions"
                    value={formData.instructions}
                    onChange={handleInputChange}
                    rows={6}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Provide detailed instructions"
                  />
                </div>
              </div>
            </div>

            {/* Schedule & Evaluation Section */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-lg font-medium text-gray-900">Schedule & Evaluation</h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Due Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative mt-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Calendar className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="date"
                      name="dueDate"
                      value={formData.dueDate}
                      onChange={handleInputChange}
                      className={`block w-full rounded-md border ${
                        errors.dueDate ? "border-red-500" : "border-gray-300"
                      } pl-10 pr-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                    />
                  </div>
                  {errors.dueDate && <p className="mt-1 text-sm text-red-600">{errors.dueDate}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Due Time <span className="text-red-500">*</span>
                  </label>
                  <div className="relative mt-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Clock className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="time"
                      name="dueTime"
                      value={formData.dueTime}
                      onChange={handleInputChange}
                      className={`block w-full rounded-md border ${
                        errors.dueTime ? "border-red-500" : "border-gray-300"
                      } pl-10 pr-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                    />
                  </div>
                  {errors.dueTime && <p className="mt-1 text-sm text-red-600">{errors.dueTime}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Total Marks <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="totalMarks"
                    value={formData.totalMarks}
                    onChange={handleInputChange}
                    min="1"
                    className={`mt-1 block w-full rounded-md border ${
                      errors.totalMarks ? "border-red-500" : "border-gray-300"
                    } px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                  />
                  {errors.totalMarks && <p className="mt-1 text-sm text-red-600">{errors.totalMarks}</p>}
                </div>
              </div>
            </div>

            {/* Attachments Section */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-lg font-medium text-gray-900">Attachments</h2>
              {/* Existing attachments */}
              {formData.attachments && formData.attachments.length > 0 && (
                <div className="mb-4">
                  <h3 className="mb-2 text-sm font-medium text-gray-700">Current Files</h3>
                  <ul className="space-y-2">
                    {formData.attachments.map((attachment) => (
                      <li
                        key={attachment._id}
                        className="flex items-center justify-between rounded-md border border-gray-200 px-3 py-2"
                      >
                        <div className="flex items-center">
                          <FileText className="mr-2 h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-700">
                            {attachment.originalName || attachment.filename}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAttachment('existing', attachment._id)}
                          className="ml-2 text-gray-400 hover:text-red-500"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-2">
                <label
                  htmlFor="file-upload"
                  className="flex cursor-pointer items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  <span>Add Files</span>
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                </label>
                <p className="mt-1 text-xs text-gray-500">
                  Supported formats: PDF, DOCX, images
                </p>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-between rounded-lg bg-white p-6 shadow">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isDraft"
                  name="isDraft"
                  checked={formData.isDraft}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isDraft" className="ml-2 text-sm text-gray-700">
                  Save as draft
                </label>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => navigate("/assignments")}
                  className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e, true)}
                  className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                  disabled={submitting}
                >
                  Save as Draft
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:bg-blue-300"
                  disabled={submitting}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Publish Assignment
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default AssignmentUpdateForm;