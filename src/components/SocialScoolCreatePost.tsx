import { useState } from "react";
import { Image, Video, MapPin, Smile, Send, X } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";

export function SocialScoolCreatePost() {
  const [content, setContent] = useState("");
  const [location, setLocation] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showTagInput, setShowTagInput] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const popularTags = [
    "#EstudioGrupal", "#ExamenesFinal", "#ProyectoFinal", "#CafeteriaUni", 
    "#BibliotecaEstudio", "#EventosUni", "#NuevosCursos", "#Ayuda"
  ];

  const addTag = (tag: string) => {
    if (!selectedTags.includes(tag) && selectedTags.length < 5) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const removeTag = (tag: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tag));
  };

  const handleCustomTag = () => {
    if (tagInput.trim() && !selectedTags.includes(`#${tagInput}`) && selectedTags.length < 5) {
      addTag(`#${tagInput}`);
      setTagInput("");
      setShowTagInput(false);
    }
  };

  const handlePost = () => {
    if (content.trim()) {
      // Aquí se enviaría el post al backend
      console.log("Posting:", { content, location, tags: selectedTags });
      setContent("");
      setLocation("");
      setSelectedTags([]);
      setIsExpanded(false);
    }
  };

  return (
    <Card className="mb-4 md:mb-6 border border-gray-200 shadow-sm">
      <CardContent className="p-3 md:p-4">
        <div className="flex space-x-3">
          <Avatar className="w-10 h-10 md:w-12 md:h-12">
            <AvatarImage src="https://images.unsplash.com/photo-1561065533-316e3142d586?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZSUyMHN0dWRlbnQlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NTgyMjA1NzJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" alt="Mi perfil" />
            <AvatarFallback className="bg-gradient-to-r from-purple-400 to-pink-400 text-white">
              AS
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <Textarea
              placeholder="¿Qué está pasando en tu universidad?"
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                if (!isExpanded && e.target.value.length > 0) {
                  setIsExpanded(true);
                }
              }}
              className="min-h-16 md:min-h-20 border-0 resize-none focus:ring-0 text-sm md:text-lg placeholder:text-gray-400"
            />

            {/* Expanded content */}
            {isExpanded && (
              <>
                {/* Location Input */}
                {location !== undefined && (
                  <div className="mt-3">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="¿Dónde estás?"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="border-0 focus:ring-0 text-sm text-gray-600"
                      />
                    </div>
                  </div>
                )}

                {/* Selected Tags */}
                {selectedTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {selectedTags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 flex items-center gap-1 text-xs"
                      >
                        {tag}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 hover:bg-transparent"
                          onClick={() => removeTag(tag)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Popular Tags */}
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs md:text-sm font-medium text-gray-700 mb-2">Tags populares:</p>
                  <div className="flex flex-wrap gap-1 md:gap-2">
                    {popularTags.slice(0, 6).map((tag, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => addTag(tag)}
                        disabled={selectedTags.includes(tag) || selectedTags.length >= 5}
                        className="text-xs h-6 md:h-7 px-2 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-300"
                      >
                        {tag}
                      </Button>
                    ))}
                  </div>
                  
                  {/* Custom Tag Input */}
                  {showTagInput ? (
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="text-sm">#</span>
                      <Input
                        placeholder="Escribe tu tag"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleCustomTag()}
                        className="text-sm h-6 md:h-7"
                      />
                      <Button size="sm" onClick={handleCustomTag} className="h-6 md:h-7 px-2 text-xs">
                        Añadir
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowTagInput(true)}
                      disabled={selectedTags.length >= 5}
                      className="text-xs text-purple-600 hover:text-purple-700 mt-2 h-6 md:h-7"
                    >
                      + Crear tag personalizado
                    </Button>
                  )}
                </div>
              </>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between mt-3 md:mt-4 pt-3 border-t border-gray-100">
              <div className="flex space-x-1">
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8 px-2 md:px-3">
                  <Image className="w-4 h-4 md:w-5 md:h-5 md:mr-1" />
                  <span className="hidden md:inline">Foto</span>
                </Button>
                <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700 hover:bg-green-50 h-8 px-2 md:px-3">
                  <Video className="w-4 h-4 md:w-5 md:h-5 md:mr-1" />
                  <span className="hidden md:inline">Video</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLocation("")}
                  className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 h-8 px-2 md:px-3"
                >
                  <MapPin className="w-4 h-4 md:w-5 md:h-5 md:mr-1" />
                  <span className="hidden md:inline">Ubicación</span>
                </Button>
                <Button variant="ghost" size="sm" className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 h-8 px-2 md:px-3 hidden md:flex">
                  <Smile className="w-4 h-4 md:w-5 md:h-5 md:mr-1" />
                  <span className="hidden md:inline">Emoji</span>
                </Button>
              </div>
              
              <Button
                onClick={handlePost}
                disabled={!content.trim()}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white h-8 px-3 md:px-4 text-xs md:text-sm"
              >
                <Send className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
                <span className="hidden md:inline">Publicar</span>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}