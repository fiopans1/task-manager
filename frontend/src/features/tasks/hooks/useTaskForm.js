import { useEffect, useState } from "react";
import dayjs from "dayjs";
import taskService from "@/services/taskService";
import { errorToast, promiseToast } from "@/shared/feedback/Noty";

const EMPTY_FORM = {
  nameOfTask: "",
  descriptionOfTask: "",
  state: "NEW",
  priority: "MIN",
  isEvent: false,
  startDate: "",
  endDate: "",
  id: null,
};

const EMPTY_DATES = {
  startDate: "",
  startTime: "",
  endDate: "",
  endTime: "",
};

export function useTaskForm({ open, mode, initialData, onSaved, onSave }) {
  const isEdit = mode === "edit";
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [isEvent, setIsEvent] = useState(false);
  const [validated, setValidated] = useState(false);
  const [dateError, setDateError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [dateFields, setDateFields] = useState(EMPTY_DATES);

  useEffect(() => {
    if (!open) return;

    if (isEdit && initialData) {
      setFormData({
        nameOfTask: initialData.nameOfTask || "",
        descriptionOfTask: initialData.descriptionOfTask || "",
        state: initialData.state || "NEW",
        priority: initialData.priority || "MIN",
        isEvent: initialData.isEvent || false,
        startDate: initialData.startDate || "",
        endDate: initialData.endDate || "",
        id: initialData.id || null,
      });
      setIsEvent(Boolean(initialData.isEvent));

      const start = initialData.isEvent && initialData.startDate ? dayjs(initialData.startDate) : null;
      const end = initialData.isEvent && initialData.endDate ? dayjs(initialData.endDate) : null;

      setDateFields({
        startDate: start ? start.format("YYYY-MM-DD") : "",
        startTime: start ? start.format("HH:mm") : "",
        endDate: end ? end.format("YYYY-MM-DD") : "",
        endTime: end ? end.format("HH:mm") : "",
      });
    } else {
      setFormData(EMPTY_FORM);
      setIsEvent(false);
      setDateFields(EMPTY_DATES);
    }

    setValidated(false);
    setDateError("");
  }, [open, isEdit, initialData]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleEventToggle = () => {
    const nextValue = !isEvent;
    setIsEvent(nextValue);
    setFormData((current) => ({ ...current, isEvent: nextValue }));
    if (!nextValue) setDateError("");
  };

  const setDateField = (field) => (event) => {
    setDateFields((current) => ({ ...current, [field]: event.target.value }));
  };

  const validate = () => {
    if (!formData.nameOfTask || formData.nameOfTask.trim() === "") {
      return false;
    }

    if (isEvent) {
      const { startDate, startTime, endDate, endTime } = dateFields;
      if (!startDate || !startTime || !endDate || !endTime) {
        setDateError("All event date and time fields are required");
        return false;
      }

      const start = dayjs(`${startDate}T${startTime}`);
      const end = dayjs(`${endDate}T${endTime}`);
      if (end.isBefore(start)) {
        setDateError("End date must be after start date");
        return false;
      }
      setDateError("");
    }

    return true;
  };

  const submit = async () => {
    setValidated(true);
    if (!validate()) return false;

    setSubmitting(true);
    try {
      const taskData = { ...formData };

      if (taskData.isEvent) {
        if (dateFields.startDate && dateFields.startTime) {
          taskData.startDate = dayjs(
            `${dateFields.startDate}T${dateFields.startTime}`,
          ).toISOString();
        }
        if (dateFields.endDate && dateFields.endTime) {
          taskData.endDate = dayjs(
            `${dateFields.endDate}T${dateFields.endTime}`,
          ).toISOString();
        }
      }

      if (onSave) {
        await promiseToast(Promise.resolve(onSave(taskData)), {
          loading: isEdit ? "Updating task..." : "Creating task...",
          success: isEdit ? "Task updated successfully" : "Task created successfully",
          error: (requestError) => `Error: ${requestError?.message || requestError}`,
        });
      } else if (isEdit) {
        if (!taskData.id) {
          errorToast("Error: Task ID is missing for update");
          return false;
        }
        await promiseToast(taskService.editTask(taskData), {
          loading: "Updating task...",
          success: "Task updated successfully",
          error: (requestError) => `Error: ${requestError?.message || requestError}`,
        });
      } else {
        await promiseToast(taskService.createTask(taskData), {
          loading: "Creating task...",
          success: "Task created successfully",
          error: (requestError) => `Error: ${requestError?.message || requestError}`,
        });
      }

      if (!isEdit) {
        setFormData(EMPTY_FORM);
        setIsEvent(false);
        setDateFields(EMPTY_DATES);
      }
      setValidated(false);
      onSaved?.();
      return true;
    } catch (error) {
      errorToast(`Error: ${error.message}`);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return {
    isEdit,
    formData,
    isEvent,
    validated,
    dateError,
    submitting,
    dateFields,
    handleChange,
    handleEventToggle,
    setDateField,
    submit,
    resetValidation: () => {
      setValidated(false);
      setDateError("");
    },
  };
}
