import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MapPin, Clock, DollarSign, Building, Users, Send } from "lucide-react";

interface JobOfferCardProps {
  jobOffer: {
    id: string;
    company_name: string;
    company_logo_url?: string;
    position_title: string;
    job_type: string;
    location: string;
    remote_allowed: boolean;
    salary_range?: {
      min: number;
      max: number;
      currency: string;
    };
    experience_level?: string;
    industry?: string;
    application_deadline?: string;
    requirements?: string[];
    benefits?: string[];
  };
}

export function JobOfferCard({ jobOffer }: JobOfferCardProps) {
  const formatSalary = (range: any) => {
    if (!range) return "Salario a convenir";
    const formatter = new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: range.currency,
      minimumFractionDigits: 0,
    });
    return `${formatter.format(range.min)} - ${formatter.format(range.max)}`;
  };

  const getJobTypeLabel = (type: string) => {
    const labels = {
      full_time: "Tiempo completo",
      part_time: "Medio tiempo",
      internship: "Práctica",
      freelance: "Freelance",
      contract: "Contrato"
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getExperienceLabel = (level?: string) => {
    const labels = {
      entry: "Sin experiencia",
      junior: "Junior",
      mid: "Mid-level",
      senior: "Senior",
      lead: "Lead"
    };
    return level ? labels[level as keyof typeof labels] || level : "";
  };

  const isDeadlineSoon = () => {
    if (!jobOffer.application_deadline) return false;
    const deadline = new Date(jobOffer.application_deadline);
    const now = new Date();
    const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysLeft <= 7;
  };

  return (
    <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {jobOffer.company_logo_url ? (
              <img 
                src={jobOffer.company_logo_url} 
                alt={jobOffer.company_name}
                className="w-12 h-12 rounded-lg object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <Building className="h-6 w-6 text-white" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-lg text-foreground">{jobOffer.position_title}</h3>
              <p className="text-sm text-muted-foreground">{jobOffer.company_name}</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            💼 Empleo
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Job details */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center text-muted-foreground">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{jobOffer.location}</span>
            {jobOffer.remote_allowed && (
              <Badge variant="outline" className="ml-2 text-xs">Remoto</Badge>
            )}
          </div>
          <div className="flex items-center text-muted-foreground">
            <Clock className="h-4 w-4 mr-1" />
            <span>{getJobTypeLabel(jobOffer.job_type)}</span>
          </div>
          {jobOffer.salary_range && (
            <div className="flex items-center text-green-600 font-medium col-span-2">
              <DollarSign className="h-4 w-4 mr-1" />
              <span>{formatSalary(jobOffer.salary_range)}</span>
            </div>
          )}
        </div>

        {/* Experience level and industry */}
        <div className="flex flex-wrap gap-2">
          {jobOffer.experience_level && (
            <Badge variant="outline">{getExperienceLabel(jobOffer.experience_level)}</Badge>
          )}
          {jobOffer.industry && (
            <Badge variant="outline">{jobOffer.industry}</Badge>
          )}
        </div>

        {/* Requirements */}
        {jobOffer.requirements && jobOffer.requirements.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-foreground mb-2">Requisitos:</h4>
            <div className="flex flex-wrap gap-1">
              {jobOffer.requirements.slice(0, 3).map((req, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {req}
                </Badge>
              ))}
              {jobOffer.requirements.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{jobOffer.requirements.length - 3} más
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Benefits */}
        {jobOffer.benefits && jobOffer.benefits.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-foreground mb-2">Beneficios:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              {jobOffer.benefits.slice(0, 2).map((benefit, index) => (
                <li key={index}>• {benefit}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Deadline warning */}
        {isDeadlineSoon() && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <div className="flex items-center text-orange-700">
              <Clock className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">
                ¡Postúlate pronto! La convocatoria cierra el{" "}
                {new Date(jobOffer.application_deadline!).toLocaleDateString()}
              </span>
            </div>
          </div>
        )}

        {/* Apply button */}
        <Button className="w-full bg-blue-600 hover:bg-blue-700">
          <Send className="h-4 w-4 mr-2" />
          Postularme
        </Button>
      </CardContent>
    </Card>
  );
}