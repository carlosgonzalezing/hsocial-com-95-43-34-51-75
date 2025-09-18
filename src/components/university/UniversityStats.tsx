import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, Users2, Activity, GraduationCap } from 'lucide-react';

interface UniversityStatsData {
  total_students: number;
  total_posts: number;
  total_groups: number;
  active_this_week: number;
  top_careers: Array<{ career: string; count: number }>;
}

interface UniversityStatsProps {
  institutionName: string;
}

export function UniversityStats({ institutionName }: UniversityStatsProps) {
  const [stats, setStats] = useState<UniversityStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      if (!institutionName) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase.rpc('get_university_stats', {
          institution_param: institutionName
        });

        if (error) throw error;
        
        if (data && data.length > 0) {
          setStats({
            total_students: Number(data[0].total_students),
            total_posts: Number(data[0].total_posts),
            total_groups: Number(data[0].total_groups),
            active_this_week: Number(data[0].active_this_week),
            top_careers: Array.isArray(data[0].top_careers) 
              ? (data[0].top_careers as Array<{ career: string; count: number }>)
              : []
          });
        }
      } catch (error) {
        console.error('Error loading university stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [institutionName]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-16 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      title: 'Estudiantes',
      value: stats.total_students,
      icon: Users,
      color: 'text-primary'
    },
    {
      title: 'Publicaciones',
      value: stats.total_posts,
      icon: FileText,
      color: 'text-blue-600'
    },
    {
      title: 'Grupos',
      value: stats.total_groups,
      icon: Users2,
      color: 'text-green-600'
    },
    {
      title: 'Activos esta semana',
      value: stats.active_this_week,
      icon: Activity,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                <div>
                  <p className="text-2xl font-bold">{stat.value.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {stats.top_careers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Carreras más populares
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.top_careers.map((career, index) => (
                <div key={career.career} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-6 h-6 bg-primary/10 text-primary rounded-full text-sm font-medium">
                      {index + 1}
                    </span>
                    <span className="font-medium">{career.career}</span>
                  </div>
                  <span className="text-muted-foreground">{career.count} estudiantes</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}