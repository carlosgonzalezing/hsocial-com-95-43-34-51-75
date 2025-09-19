import { useState } from "react";
import { Heart, MessageCircle, Share, Bookmark, MoreHorizontal, MapPin } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface PostAuthor {
  name: string;
  avatar: string;
  course: string;
  year: string;
}

interface Post {
  id: string;
  author: PostAuthor;
  content: string;
  image?: string;
  timestamp: string;
  location?: string;
  likes: number;
  comments: number;
  shares: number;
  tags: string[];
  isLiked: boolean;
  isBookmarked: boolean;
}

interface SocialScoolPostCardProps {
  post: Post;
}

export function SocialScoolPostCard({ post }: SocialScoolPostCardProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked);
  const [likesCount, setLikesCount] = useState(post.likes);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const getTagColor = (tag: string) => {
    const colors = {
      "#ExamenesFinal": "bg-gradient-to-r from-red-100 to-red-200 text-red-700",
      "#Medicina": "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700",
      "#EstudioGrupal": "bg-gradient-to-r from-green-100 to-green-200 text-green-700",
      "#Robótica": "bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700",
      "#ProyectoFinal": "bg-gradient-to-r from-orange-100 to-orange-200 text-orange-700",
      "#Ingeniería": "bg-gradient-to-r from-indigo-100 to-indigo-200 text-indigo-700",
      "#CafeteriaUni": "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-700",
      "#EstudioAmigo": "bg-gradient-to-r from-teal-100 to-teal-200 text-teal-700",
      "#NuevoLugar": "bg-gradient-to-r from-pink-100 to-pink-200 text-pink-700",
      "#BibliotecaEstudio": "bg-gradient-to-r from-cyan-100 to-cyan-200 text-cyan-700",
      "#Tesis": "bg-gradient-to-r from-violet-100 to-violet-200 text-violet-700",
      "#Arquitectura": "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700",
      "#DiseñoGráfico": "bg-gradient-to-r from-fuchsia-100 to-fuchsia-200 text-fuchsia-700",
      "#PrimerProyecto": "bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-700",
      "#Branding": "bg-gradient-to-r from-amber-100 to-amber-200 text-amber-700",
      "#Hackathon": "bg-gradient-to-r from-rose-100 to-rose-200 text-rose-700",
      "#EventosUni": "bg-gradient-to-r from-lime-100 to-lime-200 text-lime-700",
      "#Programación": "bg-gradient-to-r from-sky-100 to-sky-200 text-sky-700",
    };
    return colors[tag as keyof typeof colors] || "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700";
  };

  return (
    <Card className="mb-4 md:mb-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4 md:p-6">
        {/* Post Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={post.author.avatar} alt={post.author.name} />
              <AvatarFallback className="bg-gradient-to-r from-purple-400 to-pink-400 text-white">
                {post.author.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-sm md:text-base">{post.author.name}</h3>
                <Badge variant="outline" className="text-xs">
                  {post.author.course} • {post.author.year}
                </Badge>
              </div>
              <div className="flex items-center space-x-2 text-xs md:text-sm text-gray-500 mt-1">
                <span>{post.timestamp}</span>
                {post.location && (
                  <>
                    <span>•</span>
                    <div className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      <span>{post.location}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Guardar publicación</DropdownMenuItem>
              <DropdownMenuItem>Ocultar publicación</DropdownMenuItem>
              <DropdownMenuItem>Reportar</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Post Content */}
        <div className="mb-4">
          <p className="text-sm md:text-base leading-relaxed mb-3">{post.content}</p>
          
          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {post.tags.map((tag, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className={`text-xs cursor-pointer hover:opacity-80 transition-opacity ${getTagColor(tag)}`}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Post Image */}
          {post.image && (
            <div className="rounded-lg overflow-hidden">
              <img
                src={post.image}
                alt="Post content"
                className="w-full h-auto max-h-96 object-cover"
              />
            </div>
          )}
        </div>

        {/* Engagement Stats */}
        <div className="flex items-center justify-between text-xs md:text-sm text-gray-500 mb-3 pt-2 border-t border-gray-100">
          <span>{likesCount} me gusta</span>
          <div className="flex space-x-4">
            <span>{post.comments} comentarios</span>
            <span>{post.shares} compartidas</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex space-x-1 md:space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`flex items-center space-x-1 md:space-x-2 h-8 md:h-10 px-2 md:px-4 transition-colors ${
                isLiked ? 'text-red-600 hover:text-red-700' : 'text-gray-600 hover:text-red-600'
              }`}
            >
              <Heart className={`w-4 h-4 md:w-5 md:h-5 ${isLiked ? 'fill-current' : ''}`} />
              <span className="hidden sm:inline text-xs md:text-sm">Me gusta</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-1 md:space-x-2 h-8 md:h-10 px-2 md:px-4 text-gray-600 hover:text-blue-600"
            >
              <MessageCircle className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden sm:inline text-xs md:text-sm">Comentar</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-1 md:space-x-2 h-8 md:h-10 px-2 md:px-4 text-gray-600 hover:text-green-600"
            >
              <Share className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden sm:inline text-xs md:text-sm">Compartir</span>
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBookmark}
            className={`h-8 md:h-10 w-8 md:w-10 p-0 transition-colors ${
              isBookmarked ? 'text-yellow-600 hover:text-yellow-700' : 'text-gray-600 hover:text-yellow-600'
            }`}
          >
            <Bookmark className={`w-4 h-4 md:w-5 md:h-5 ${isBookmarked ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}