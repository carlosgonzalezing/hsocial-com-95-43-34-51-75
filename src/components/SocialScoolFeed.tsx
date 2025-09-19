import { SocialScoolPostCard } from "./SocialScoolPostCard";
import { SocialScoolCreatePost } from "./SocialScoolCreatePost";

interface SocialScoolFeedProps {
  activeTab?: string;
}

export function SocialScoolFeed({ activeTab = "home" }: SocialScoolFeedProps) {
  // Mock data para posts de estudiantes con contexto universitario
  const posts = [
    {
      id: "1",
      author: {
        name: "María González",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b2e02043?w=150&h=150&fit=crop&crop=face",
        course: "Medicina",
        year: "4to año"
      },
      content: "¡Acabo de terminar mi examen de anatomía! 😅 Fue difícil pero creo que me fue bien. ¿Alguien más tiene exámenes esta semana? Podemos hacer un grupo de estudio para los próximos. 📚",
      timestamp: "hace 15 minutos",
      location: "Facultad de Medicina",
      likes: 24,
      comments: 8,
      shares: 3,
      tags: ["#ExamenesFinal", "#Medicina", "#EstudioGrupal"],
      isLiked: false,
      isBookmarked: true
    },
    {
      id: "2",
      author: {
        name: "Carlos Ramírez",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        course: "Ingeniería",
        year: "3er año"
      },
      content: "Nuestro proyecto de robótica finalmente funciona! 🤖 Después de semanas de debugging y noches sin dormir, el robot puede navegar autónomamente por el laberinto. El trabajo en equipo realmente vale la pena.",
      image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&h=400&fit=crop",
      timestamp: "hace 1 hora",
      location: "Laboratorio de Robótica",
      likes: 67,
      comments: 15,
      shares: 12,
      tags: ["#Robótica", "#ProyectoFinal", "#Ingeniería"],
      isLiked: true,
      isBookmarked: false
    },
    {
      id: "3",
      author: {
        name: "Ana Silva",
        avatar: "https://images.unsplash.com/photo-1561065533-316e3142d586?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHN0dWRlbnQlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NTgyMjA1NzJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        course: "Psicología",
        year: "2do año"
      },
      content: "La nueva cafetería del campus está increíble! ☕ Tienen opciones veganas y el wifi es súper rápido. Perfecto para estudiar entre clases. Además, los precios son bastante accesibles para estudiantes.",
      image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&h=400&fit=crop",
      timestamp: "hace 2 horas",
      location: "Cafetería Central",
      likes: 43,
      comments: 22,
      shares: 7,
      tags: ["#CafeteriaUni", "#EstudioAmigo", "#NuevoLugar"],
      isLiked: true,
      isBookmarked: true
    },
    {
      id: "4",
      author: {
        name: "Diego Morales",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        course: "Arquitectura",
        year: "5to año"
      },
      content: "¿Alguien sabe si la biblioteca estará abierta el fin de semana? Necesito acceso a los libros de historia del arte para mi tesis. También busco compañeros de estudio para las materias de diseño urbano.",
      timestamp: "hace 3 horas",
      likes: 18,
      comments: 12,
      shares: 2,
      tags: ["#BibliotecaEstudio", "#Tesis", "#Arquitectura"],
      isLiked: false,
      isBookmarked: false
    },
    {
      id: "5",
      author: {
        name: "Sofia Herrera",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
        course: "Diseño Gráfico",
        year: "1er año"
      },
      content: "¡Mi primer proyecto de branding está listo! 🎨 Es para una marca ficticia de café sostenible. Gracias a todos los que me dieron feedback en las primeras versiones. Los comentarios constructivos realmente ayudaron a mejorarlo.",
      image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&h=400&fit=crop",
      timestamp: "hace 4 horas",
      location: "Aula de Diseño",
      likes: 89,
      comments: 31,
      shares: 18,
      tags: ["#DiseñoGráfico", "#PrimerProyecto", "#Branding"],
      isLiked: true,
      isBookmarked: true
    },
    {
      id: "6",
      author: {
        name: "Luis Campos",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
        course: "Ciencias de la Computación",
        year: "4to año"
      },
      content: "Organizando un hackathon para el próximo mes! 💻 Estamos buscando estudiantes de todas las carreras que quieran participar. Premios geniales y la oportunidad de trabajar en proyectos reales con empresas tech locales.",
      timestamp: "hace 5 horas",
      likes: 156,
      comments: 43,
      shares: 28,
      tags: ["#Hackathon", "#EventosUni", "#Programación"],
      isLiked: false,
      isBookmarked: true
    }
  ];

  // Content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case "friends":
        return (
          <div className="text-center py-8">
            <h2 className="text-xl mb-4">Mis Amigos</h2>
            <p className="text-gray-600">Aquí verás las publicaciones de tus amigos</p>
          </div>
        );
      case "groups":
        return (
          <div className="text-center py-8">
            <h2 className="text-xl mb-4">Grupos de Estudio</h2>
            <p className="text-gray-600">Tus grupos de estudio aparecerán aquí</p>
          </div>
        );
      case "messages":
        return (
          <div className="text-center py-8">
            <h2 className="text-xl mb-4">Mensajes</h2>
            <p className="text-gray-600">Tus conversaciones privadas</p>
          </div>
        );
      case "profile":
        return (
          <div className="text-center py-8">
            <h2 className="text-xl mb-4">Mi Perfil</h2>
            <p className="text-gray-600">Tu información personal y configuración</p>
          </div>
        );
      default:
        return (
          <>
            <SocialScoolCreatePost />
            <div className="space-y-0">
              {posts.map((post) => (
                <SocialScoolPostCard key={post.id} post={post} />
              ))}
            </div>
          </>
        );
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-4 md:py-6 px-4 md:px-0 pb-20 md:pb-6">
      {renderContent()}
    </div>
  );
}