import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function useRegister(setLoading: (loading: boolean) => void, sendVerificationEmail: (email: string, username: string) => Promise<any>) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [career, setCareer] = useState("");
  const [semester, setSemester] = useState("");
  const [birthDate, setBirthDate] = useState<Date | undefined>(undefined);
  const [gender, setGender] = useState("");
  const [institutionName, setInstitutionName] = useState("");
  const [academicRole, setAcademicRole] = useState("");
  const { toast } = useToast();

  const validateAge = (birthDate: Date): boolean => {
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1 >= 15;
    }
    
    return age >= 15;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validar que los campos obligatorios estén completos
      if (!career) {
        throw new Error("Por favor selecciona una carrera");
      }
      if (!semester) {
        throw new Error("Por favor selecciona un semestre");
      }
      if (!birthDate) {
        throw new Error("Por favor ingresa tu fecha de nacimiento");
      }
      if (!gender) {
        throw new Error("Por favor selecciona tu sexo");
      }
      if (!institutionName) {
        throw new Error("Por favor selecciona tu institución educativa");
      }
      if (!academicRole) {
        throw new Error("Por favor selecciona tu rol académico");
      }

      // Validar que el usuario tenga al menos 15 años
      if (!validateAge(birthDate)) {
        throw new Error("Debes tener al menos 15 años para crear una cuenta");
      }

      // Prepare birth_date in ISO format for database storage
      const formattedBirthDate = birthDate ? birthDate.toISOString().split('T')[0] : null;

      // Primero registramos al usuario
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            career,
            semester,
            birth_date: formattedBirthDate,
            gender,
            institution_name: institutionName,
            academic_role: academicRole,
          },
          emailRedirectTo: window.location.origin,
        },
      });
      
      if (error) throw error;

      // También actualizamos la tabla de perfiles con los nuevos campos
      if (data.user) {
        const { error: profileError } = await (supabase as any).from('profiles').upsert({
          id: data.user.id,
          username,
          career,
          semester,
          birth_date: formattedBirthDate,
          gender,
          institution_name: institutionName,
          academic_role: academicRole,
        });
        
        if (profileError) {
          console.error("Error updating profile:", profileError);
        }
        
        // Enviar correo de verificación personalizado
        try {
          await sendVerificationEmail(email, username);
          console.log("Correo de verificación enviado exitosamente");
        } catch (emailError) {
          console.error("Error al enviar correo personalizado:", emailError);
          // Continuamos con el proceso aunque falle el envío del correo personalizado
        }
      }

      toast({
        title: "¡Registro exitoso!",
        description: "Por favor revisa tu correo electrónico para verificar tu cuenta. Te hemos enviado instrucciones detalladas sobre los siguientes pasos.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    username,
    setUsername,
    career,
    setCareer,
    semester,
    setSemester,
    birthDate,
    setBirthDate,
    gender,
    setGender,
    institutionName,
    setInstitutionName,
    academicRole,
    setAcademicRole,
    handleRegister
  };
}
