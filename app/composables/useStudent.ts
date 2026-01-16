import { ref } from 'vue';
import axios from 'axios';
import { useRuntimeConfig } from '#imports';

export type Student = {
  id: number;
  name_kh: string;
  name_en: string;
  dob: string;
  phone: string;
  gender: 'M' | 'F' | 'O';
  image?: string;
  image_url?: string;
  image_thumb?: string;
};

export const useStudent = () => {
  const students = ref<Student[]>([]);
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase;

  const getStudents = async () => {
    const res = await axios.get(`${apiBase}/students`);
    students.value = res.data.map((s: Student) => ({
      ...s,
      image_thumb: s.image ? `${apiBase}/uploads/students/${s.image}?t=${Date.now()}` : null,

      image_url: s.image
        ? `${apiBase}/uploads/students/${s.image}`
        : null
    }));
    return students.value;
  };

  const createStudent = async (form: FormData) => {
    await axios.post(`${apiBase}/students`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
  };

  const updateStudent = async (id: number, form: FormData) => {
    await axios.put(`${apiBase}/students/${id}`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
  };

  const deleteStudent = async (id: number) => {
    await axios.delete(`${apiBase}/students/${id}`);
  };

  return { students, getStudents, createStudent, updateStudent, deleteStudent };
};
