import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { academicRoles } from "@/data/institutions";

interface UserInfoFieldsProps {
  username: string;
  setUsername: (username: string) => void;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  birthDate: Date | undefined;
  setBirthDate: (date: Date | undefined) => void;
  gender: string;
  setGender: (gender: string) => void;
  institutionName: string;
  setInstitutionName: (institutionName: string) => void;
  academicRole: string;
  setAcademicRole: (academicRole: string) => void;
  loading: boolean;
}

export function UserInfoFields({
  username,
  setUsername,
  email,
  setEmail,
  password,
  setPassword,
  birthDate,
  setBirthDate,
  gender,
  setGender,
  institutionName,
  setInstitutionName,
  academicRole,
  setAcademicRole,
  loading
}: UserInfoFieldsProps) {
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value;
    if (dateValue) {
      const date = new Date(dateValue);
      setBirthDate(date);
    } else {
      setBirthDate(undefined);
    }
  };

  const formatDateForInput = (date: Date | undefined) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  return (
    <>
      <div>
        <label htmlFor="username" className="block text-sm font-medium mb-1">
          Nombre de usuario
        </label>
        <Input
          id="username"
          name="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          disabled={loading}
          autoComplete="username"
        />
      </div>

      <div>
        <label htmlFor="register-email" className="block text-sm font-medium mb-1">
          Email
        </label>
        <Input
          id="register-email"
          name="register-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
          autoComplete="email"
        />
      </div>
      
      <div>
        <label htmlFor="register-password" className="block text-sm font-medium mb-1">
          Contraseña
        </label>
        <Input
          id="register-password"
          name="register-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
          autoComplete="new-password"
        />
      </div>

      <div>
        <label htmlFor="institution" className="block text-sm font-medium mb-1">
          Institución Educativa *
        </label>
        <Input
          id="institution"
          name="institution"
          type="text"
          value={institutionName}
          onChange={(e) => setInstitutionName(e.target.value)}
          placeholder="Escribe el nombre de tu institución"
          required
          disabled={loading}
          autoComplete="organization"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Ejemplo: Universidad Nacional, SENA, Colegio San Patricio, etc.
        </p>
      </div>

      <div>
        <label htmlFor="academic-role" className="block text-sm font-medium mb-1">
          Rol Académico *
        </label>
        <Select value={academicRole} onValueChange={setAcademicRole} disabled={loading}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona tu rol" />
          </SelectTrigger>
          <SelectContent>
            {academicRoles.map((role) => (
              <SelectItem key={role.value} value={role.value}>
                {role.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label htmlFor="gender" className="block text-sm font-medium mb-1">
          Sexo
        </label>
        <Select value={gender} onValueChange={setGender} disabled={loading}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona tu sexo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="masculino">Masculino</SelectItem>
            <SelectItem value="femenino">Femenino</SelectItem>
            <SelectItem value="otro">Otro</SelectItem>
            <SelectItem value="prefiero_no_decir">Prefiero no decir</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label htmlFor="birth-date" className="block text-sm font-medium mb-1">
          Fecha de nacimiento *
        </label>
        <Input
          id="birth-date"
          name="birth-date"
          type="text"
          value={birthDate ? birthDate.toLocaleDateString('es-CO') : ''}
          onChange={(e) => {
            const value = e.target.value;
            // Allow typing in DD/MM/YYYY or DD-MM-YYYY format
            const dateRegex = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/;
            const match = value.match(dateRegex);
            
            if (match) {
              const [, day, month, year] = match;
              const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
              
              // Validate the date is reasonable
              if (date.getFullYear() === parseInt(year) && 
                  date.getMonth() === parseInt(month) - 1 && 
                  date.getDate() === parseInt(day) &&
                  parseInt(year) >= 1900 && 
                  parseInt(year) <= new Date().getFullYear()) {
                setBirthDate(date);
              }
            } else if (value === '') {
              setBirthDate(undefined);
            }
          }}
          placeholder="DD/MM/AAAA (ej: 15/03/1995)"
          required
          disabled={loading}
          className="w-full"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Escribe tu fecha de nacimiento en formato DD/MM/AAAA. Debes tener al menos 15 años.
        </p>
      </div>
    </>
  );
}