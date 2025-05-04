import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

const AssignmentForm = () => {
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
  const [teacherTimetables, setTeacherTimetables] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setServerError("");

        const [classesRes, subjectsRes, timetablesRes] = await Promise.all([
          authAxios.get("classes"),
          authAxios.get("subjects"),
          authAxios.get(`timetables/teacher/class/${userData.id}`)
        ]);

        const allClasses = classesRes.data.data || [];
        const subjectsData = subjectsRes.data.data || [];
        const teacherData = timetablesRes.data.data || [];

        setTeacherTimetables(teacherData);
        setAllSubjects(subjectsData);

        const classIds = new Set();
        teacherData.forEach(timetable => {
          if (timetable.class?._id) classIds.add(timetable.class._id);
        });

        const filteredClasses = allClasses.filter(cls => classIds.has(cls._id));
        setClasses(filteredClasses);

      } catch (err) {
        console.error("Failed to load data:", err);
        setServerError("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userData.id]);

  useEffect(() => {
    if (formData.classId) {
      updateSubjectsForClass(formData.classId);
    } else {
      setSubjects([]);
    }
  }, [formData.classId, teacherTimetables]);

  const updateSubjectsForClass = (classId) => {
    const classSubjects = teacherTimetables
      .filter(t => t.class?._id === classId)
      .flatMap(t => t.periods || [])
      .map(p => p.subject)
      .filter((subj, index, self) => 
        subj && self.findIndex(s => s?._id === subj?._id) === index
      );

    if (classSubjects.length === 0) {
      const filteredSubjects = allSubjects.filter(
        subject => subject.class === classId || subject.class?._id === classId
      );
      setSubjects(filteredSubjects);
    } else {
      setSubjects(classSubjects);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.classId) newErrors.classId = "Class is required";
    if (!formData.subjectId) newErrors.subjectId = "Subject is required";
    if (!formData.dueDate) newErrors.dueDate = "Due date is required";
    if (!formData.dueTime) newErrors.dueTime = "Due time is required";
    if (formData.totalMarks <= 0) newErrors.totalMarks = "Total marks must be greater than 0";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData({ ...formData, [name]: checked });
  };

  const handleFileChange = (e) => {
    setNewAttachments([...newAttachments, ...Array.from(e.target.files)]);
  };

  const removeNewAttachment = (index) => {
    setNewAttachments(newAttachments.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e, asDraft = false) => {
    e.preventDefault();
    const dataToSubmit = { ...formData, isDraft: asDraft };
    
    if (!asDraft && !validateForm()) return;

    try {
      setSubmitting(true);
      setServerError("");

      const dueDateTime = new Date(`${dataToSubmit.dueDate}T${dataToSubmit.dueTime}`);
      const formDataObj = new FormData();
      
      formDataObj.append("title", dataToSubmit.title);
      formDataObj.append("description", dataToSubmit.description);
      formDataObj.append("classId", dataToSubmit.classId);
      formDataObj.append("subjectId", dataToSubmit.subjectId);
      formDataObj.append("dueDate", dueDateTime.toISOString());
      formDataObj.append("totalMarks", dataToSubmit.totalMarks);
      formDataObj.append("instructions", dataToSubmit.instructions);
      formDataObj.append("isDraft", dataToSubmit.isDraft);

      newAttachments.forEach(file => {
        formDataObj.append("attachments", file);
      });

      await authAxios.post("assignments", formDataObj, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      navigate("/assignments");
    } catch (err) {
      console.error("Failed to save assignment:", err);
      setServerError(err.response?.data?.message || "Failed to save assignment. Please try again.");
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
            Create New Assignment
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Create a new assignment for your students
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
              {newAttachments.length > 0 && (
                <div className="mb-4">
                  <h3 className="mb-2 text-sm font-medium text-gray-700">Files to Upload</h3>
                  <ul className="space-y-2">
                    {newAttachments.map((file, index) => (
                      <li
                        key={index}
                        className="flex items-center justify-between rounded-md border border-gray-200 px-3 py-2"
                      >
                        <div className="flex items-center">
                          <FileText className="mr-2 h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-700">{file.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeNewAttachment(index)}
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
                  onChange={handleCheckboxChange}
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

export default AssignmentForm;