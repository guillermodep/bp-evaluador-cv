import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle2, User, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [formState, setFormState] = useState<'initial' | 'submitting' | 'success' | 'error'>('initial');
  const navigate = useNavigate();

  // Animación para los elementos que aparecen
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 400, damping: 20 }
    },
    hover: {
      scale: 1.02,
      transition: { duration: 0.2 }
    },
    tap: {
      scale: 0.98,
      transition: { duration: 0.2 }
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormState('submitting');
    setError('');
    
    // Simulamos un pequeño retraso para la animación de carga
    setTimeout(() => {
      // Simple client-side validation
            if (username === 'admin' && password === 'bancopichincha') {
        // Store authentication state in localStorage
        localStorage.setItem('isAuthenticated', 'true');
        setFormState('success');
        
        // Esperar un momento para mostrar la animación de éxito antes de redirigir
        setTimeout(() => {
          // Redirect to main page
          navigate('/');
        }, 800);
      } else {
        setError('Usuario o contraseña incorrectos');
        setIsLoading(false);
        setFormState('error');
      }
    }, 1000);
  };

  // Efecto de partículas flotantes para el fondo
  const Particles = () => {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 30 }).map((_, index) => (
          <motion.div
            key={index}
            className={`absolute rounded-full ${index % 3 === 0 ? 'bg-indigo-500/10' : index % 3 === 1 ? 'bg-purple-500/10' : 'bg-blue-500/10'}`}
            style={{
              width: Math.random() * 40 + 10,
              height: Math.random() * 40 + 10,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              filter: `blur(${Math.random() * 2 + 1}px)`
            }}
            animate={{
              y: [0, Math.random() * -150 - 50],
              x: [0, Math.random() * 150 - 75],
              opacity: [0, 0.6, 0],
              scale: [0, Math.random() * 1.5 + 0.5, 0],
              rotate: [0, Math.random() * 360]
            }}
            transition={{
              duration: Math.random() * 15 + 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>
    );
  };
  
  // Efecto de luz ambiental
  const AmbientLight = () => {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-indigo-500/20 rounded-full blur-[100px] animate-float-slow"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-[100px] animate-float-medium"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 rounded-full blur-[80px]"></div>
      </div>
    );
  };
  
  // Componente de animación avanzada con CSS y React
  const AdvancedAnimation = () => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isMouseInside, setIsMouseInside] = useState(false);
    
    // Manejar el movimiento del ratón
    useEffect(() => {
      const handleMouseMove = (e: MouseEvent) => {
        setMousePosition({ x: e.clientX, y: e.clientY });
      };
      
      const handleMouseEnter = () => setIsMouseInside(true);
      const handleMouseLeave = () => setIsMouseInside(false);
      
      window.addEventListener('mousemove', handleMouseMove);
      document.body.addEventListener('mouseenter', handleMouseEnter);
      document.body.addEventListener('mouseleave', handleMouseLeave);
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        document.body.removeEventListener('mouseenter', handleMouseEnter);
        document.body.removeEventListener('mouseleave', handleMouseLeave);
      };
    }, []);
    
    // Generar partículas con diferentes propiedades
    const generateParticles = (count: number) => {
      return Array.from({ length: count }).map((_, index) => {
        // Valores aleatorios para cada partícula
        const size = Math.random() * 30 + 10;
        const duration = Math.random() * 20 + 10;
        const delay = Math.random() * 5;
        const colorIndex = Math.floor(Math.random() * 4);
        const colorClasses = [
          'bg-indigo-500/20',
          'bg-purple-500/20', 
          'bg-blue-500/20', 
          'bg-pink-500/20'
        ];
        
        // Posiciones y transformaciones aleatorias
        const startX = Math.random() * 100;
        const startY = Math.random() * 100;
        const translateX = Math.random() * 300 - 150;
        const translateY = Math.random() * 300 - 150;
        const rotate = Math.random() * 360;
        const scale = Math.random() * 1.5 + 0.2;
        
        return (
          <motion.div
            key={`background-${index}`}
            className={`absolute rounded-full ${colorClasses[colorIndex]}`}
            style={{
              width: size,
              height: size,
              left: `${startX}%`,
              top: `${startY}%`,
              filter: `blur(${Math.random() * 2 + 1}px)`
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 0.5, 0],
              scale: [0, scale, 0],
              x: [0, translateX],
              y: [0, translateY],
              rotate: [0, rotate],
            }}
            transition={{
              duration: duration,
              delay: delay,
              repeat: Infinity,
              repeatType: "loop",
              ease: "easeInOut"
            }}
          />
        );
      });
    };
    
    // Generar partículas que siguen al cursor
    const generateCursorParticles = (count: number) => {
      if (!isMouseInside) return null;
      
      return Array.from({ length: count }).map((_, index) => {
        // Valores aleatorios para cada partícula
        const size = Math.random() * 15 + 5;
        const duration = Math.random() * 2 + 1;
        const colorIndex = Math.floor(Math.random() * 4);
        const colorClasses = [
          'bg-indigo-400/40',
          'bg-purple-400/40', 
          'bg-blue-400/40', 
          'bg-pink-400/40'
        ];
        
        // Calcular posición inicial basada en la posición del ratón
        const offsetX = (Math.random() - 0.5) * 20;
        const offsetY = (Math.random() - 0.5) * 20;
        const translateX = (Math.random() - 0.5) * 100;
        const translateY = (Math.random() - 0.5) * 100;
        
        return (
          <motion.div
            key={`cursor-${index}`}
            className={`absolute rounded-full ${colorClasses[colorIndex]}`}
            style={{
              width: size,
              height: size,
              left: mousePosition.x + offsetX,
              top: mousePosition.y + offsetY,
              filter: 'blur(1px)',
              position: 'fixed',
              zIndex: 100
            }}
            initial={{ opacity: 0.8, scale: 0.8 }}
            animate={{
              opacity: [0.8, 0],
              scale: [0.8, 0],
              x: translateX,
              y: translateY,
            }}
            transition={{
              duration: duration,
              ease: "easeOut"
            }}
          />
        );
      });
    };
    
    return (
      <>
        <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 1 }}>
          {generateParticles(30)}
        </div>
        <div className="fixed inset-0 overflow-visible pointer-events-none" style={{ zIndex: 100 }}>
          {generateCursorParticles(8)}
        </div>
      </>
    );
  };

  // Estado para el efecto 3D
  const [cardRotation, setCardRotation] = useState({ x: 0, y: 0 });
  
  // Manejar el movimiento del mouse sobre la tarjeta
  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget.getBoundingClientRect();
    const cardCenterX = card.left + card.width / 2;
    const cardCenterY = card.top + card.height / 2;
    const rotateY = (e.clientX - cardCenterX) / 15;
    const rotateX = (cardCenterY - e.clientY) / 15;
    
    setCardRotation({ x: rotateX, y: rotateY });
  };
  
  // Resetear la rotación cuando el mouse sale de la tarjeta
  const handleCardMouseLeave = () => {
    setCardRotation({ x: 0, y: 0 });
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-sky-100 p-4 relative overflow-hidden">
      {/* Efectos de fondo */}
      <AmbientLight />
      <AdvancedAnimation />
      
      <AnimatePresence mode="wait">
        <motion.div
          key={formState}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 w-full max-w-md"
        >
          {/* Logo flotante */}
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.2 }}
            className="absolute -top-20 left-1/2 transform -translate-x-1/2 w-20 h-20 bg-gradient-to-br from-white to-indigo-50 rounded-full shadow-lg flex items-center justify-center border-4 border-indigo-100 z-10 animate-gentle-bounce"
          >
            <div className="relative w-12 h-12">
              <svg width="48" height="48" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-indigo-600">
                <rect x="4" y="2" width="24" height="28" rx="2" fill="currentColor" />
                <rect x="8" y="8" width="16" height="2" rx="1" fill="white" />
                <rect x="8" y="12" width="16" height="2" rx="1" fill="white" />
                <rect x="8" y="16" width="10" height="2" rx="1" fill="white" />
                <path d="M22 24L24.2 19.8L28 18.4L25 15.2L25.6 11.2L22 12.8L18.4 11.2L19 15.2L16 18.4L19.8 19.8L22 24Z" fill="#FBBF24" />
              </svg>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center shadow-sm">
                <span className="text-xs font-bold text-yellow-800">★</span>
              </div>
            </div>
          </motion.div>
          
          {/* Tarjeta principal con efecto 3D */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            animate={{
              rotateX: cardRotation.x,
              rotateY: cardRotation.y
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onMouseMove={handleCardMouseMove}
            onMouseLeave={handleCardMouseLeave}
            style={{ perspective: 1000, transformStyle: "preserve-3d" }}
            className="w-full"
          >
            <Card className="backdrop-blur-sm border border-white/50 shadow-xl overflow-hidden bg-white/30 dark:bg-gray-900/30 relative">
              {/* Efecto de brillo en los bordes */}
              <div className="absolute inset-0 rounded-lg overflow-hidden">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 animate-gradient-xy"></div>
              </div>
              
              {/* Efecto de resplandor */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -left-40 w-80 h-80 bg-indigo-500/5 rounded-full blur-[80px]"></div>
                <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-purple-500/5 rounded-full blur-[80px]"></div>
              </div>
            
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="p-8 relative z-10"
            >
              <motion.div variants={itemVariants} className="text-center mb-8">
                <motion.h1 
                  className="text-3xl font-bold mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text inline-block"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  Evaluación de Candidatos TI
                </motion.h1>
                <motion.div 
                  className="h-1 w-24 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full mx-auto mb-4"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 96, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                />
                <motion.p 
                  className="text-gray-600 dark:text-gray-300"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  Ingresa tus credenciales para continuar
                </motion.p>
              </motion.div>
              
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-6 p-0">
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -10, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Alert variant="destructive" className="mb-4 border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800/30">
                          <AlertCircle className="h-4 w-4 mr-2" />
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <motion.div 
                    variants={itemVariants}
                    whileHover="hover"
                    className="space-y-2"
                  >
                    <Label htmlFor="username" className="text-gray-700 dark:text-gray-200 flex items-center gap-2">
                      <User className="h-4 w-4 text-indigo-500" />
                      <span>Usuario</span>
                    </Label>
                    <div className={cn(
                      "relative group border rounded-lg transition-all overflow-hidden",
                      focusedInput === 'username' 
                        ? "border-indigo-400 ring-2 ring-indigo-100 dark:ring-indigo-900/30" 
                        : "border-gray-200 dark:border-gray-700"
                    )}>
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <Input 
                        id="username" 
                        type="text" 
                        placeholder="Ingresa tu usuario" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        onFocus={() => setFocusedInput('username')}
                        onBlur={() => setFocusedInput(null)}
                        className="border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent relative z-10"
                        required
                      />
                      <AnimatePresence>
                        {username && (
                          <motion.span 
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 z-10"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    variants={itemVariants}
                    whileHover="hover"
                    className="space-y-2"
                  >
                    <Label htmlFor="password" className="text-gray-700 dark:text-gray-200 flex items-center gap-2">
                      <Lock className="h-4 w-4 text-indigo-500" />
                      <span>Contraseña</span>
                    </Label>
                    <div className={cn(
                      "relative group border rounded-lg transition-all overflow-hidden",
                      focusedInput === 'password' 
                        ? "border-indigo-400 ring-2 ring-indigo-100 dark:ring-indigo-900/30" 
                        : "border-gray-200 dark:border-gray-700"
                    )}>
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <Input 
                        id="password" 
                        type={showPassword ? "text" : "password"}
                        placeholder="Ingresa tu contraseña" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setFocusedInput('password')}
                        onBlur={() => setFocusedInput(null)}
                        className="border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent pr-10 relative z-10"
                        required
                      />
                      <motion.button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-500 transition-colors z-10"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </motion.button>
                    </div>
                  </motion.div>
                  
                  <motion.div variants={itemVariants}>
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md group relative overflow-hidden h-12 rounded-lg"
                      disabled={isLoading || formState === 'submitting'}
                    >
                      <motion.span 
                        className={`flex items-center justify-center gap-2 transition-all ${isLoading || formState === 'submitting' ? 'opacity-0' : 'opacity-100'}`}
                        initial={{ y: 0 }}
                        animate={{ y: formState === 'success' ? -30 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <LogIn className="h-4 w-4" />
                        Iniciar Sesión
                      </motion.span>
                      
                      {/* Indicador de carga */}
                      {(isLoading || formState === 'submitting') && (
                        <motion.div 
                          className="absolute inset-0 flex items-center justify-center"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <div className="flex space-x-2">
                            {[0, 1, 2].map((i) => (
                              <motion.div
                                key={i}
                                animate={{ y: [0, -6, 0] }}
                                transition={{ duration: 0.6, repeat: Infinity, repeatType: 'loop', delay: i * 0.1 }}
                                className="w-2 h-2 bg-white rounded-full"
                              />
                            ))}
                          </div>
                        </motion.div>
                      )}
                      
                      {/* Indicador de éxito */}
                      {formState === 'success' && (
                        <motion.div 
                          className="absolute inset-0 flex items-center justify-center text-white"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        >
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring' }}
                          >
                            <CheckCircle2 className="h-6 w-6" />
                          </motion.div>
                        </motion.div>
                      )}
                    </Button>
                  </motion.div>
                </CardContent>
              </form>
            </motion.div>
          </Card>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Login;
