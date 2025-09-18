
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { UserInfoFields } from "./register/UserInfoFields";
import { AcademicFields } from "./register/AcademicFields";
import { useRegister } from "./register/useRegister";
import { useState } from "react";

interface RegisterFormProps {
  loading: boolean;
  setLoading: (loading: boolean) => void;
  sendVerificationEmail: (email: string, username: string) => Promise<any>;
}

export function RegisterForm({ loading, setLoading, sendVerificationEmail }: RegisterFormProps) {
  const {
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
  } = useRegister(setLoading, sendVerificationEmail);

  const [acceptsPolicy, setAcceptsPolicy] = useState(false);

  return (
    <div className="space-y-4">
      <form onSubmit={handleRegister} className="space-y-4" id="register-form" name="register-form">
        <UserInfoFields
          username={username}
          setUsername={setUsername}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          birthDate={birthDate}
          setBirthDate={setBirthDate}
          gender={gender}
          setGender={setGender}
          institutionName={institutionName}
          setInstitutionName={setInstitutionName}
          academicRole={academicRole}
          setAcademicRole={setAcademicRole}
          loading={loading}
        />
        
        <AcademicFields
          career={career}
          setCareer={setCareer}
          semester={semester}
          setSemester={setSemester}
          loading={loading}
        />
        
        <div className="flex items-start space-x-2">
          <Checkbox 
            id="policy-checkbox"
            checked={acceptsPolicy}
            onCheckedChange={(checked) => setAcceptsPolicy(checked === true)}
            required
          />
          <label htmlFor="policy-checkbox" className="text-sm text-muted-foreground leading-tight">
            Acepto la Política de Tratamiento de Datos Personales y autorizo el uso de mi información para fines académicos y de personalización dentro de 'Hsocial'.
          </label>
        </div>
        
        <Button type="submit" className="w-full" disabled={loading || !acceptsPolicy}>
          {loading ? "Cargando..." : "Crear cuenta"}
        </Button>
      </form>
    </div>
  );
}
