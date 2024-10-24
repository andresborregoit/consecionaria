'use client'

import { useEffect, useContext, useRef, useState } from 'react'
import Contexto from '../context/Contexto'
import { database } from '../firebase'
import { ref, onValue, off, push, set, remove, update } from 'firebase/database'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Trash2, Edit2, PlusCircle, MinusCircle, Camera, Calculator } from 'lucide-react'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import EditarAuto from '../Components/EditarAuto'
import EditarGasto from '../Components/EditarGasto'

export default function Concesionaria() {
    const { estado, dispatch } = useContext(Contexto);
    const fileInputRef = useRef(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isEditGastoDialogOpen, setIsEditGastoDialogOpen] = useState(false);
    const [gastoEnEdicion, setGastoEnEdicion] = useState(null);

    useEffect(() => {
        console.log('Inicializando efecto de carga de autos');
        const autosRef = ref(database, 'autos');
        
        const handleData = (snapshot) => {
            console.log('Datos recibidos de Firebase:', snapshot.val());
            const data = snapshot.val();
            if (data) {
                const autosArray = Object.entries(data).map(([key, value]) => ({
                    id: key,
                    ...value,
                    gastos: value.gastos ? Object.entries(value.gastos).map(([gastoId, gasto]) => ({
                        id: gastoId,
                        ...gasto
                    })) : []
                }));
                dispatch({ type: 'CARGAR_AUTOS_SILENCIOSO', payload: autosArray });
            } else {
                dispatch({ type: 'CARGAR_AUTOS_SILENCIOSO', payload: [] });
            }
        };

        onValue(autosRef, handleData);
        
        return () => {
            console.log('Limpiando suscripción');
            off(autosRef);
        };
    }, [dispatch]);

    const agregarAuto = async (e) => {
        e.preventDefault();
        
        if (isSubmitting) return;
        
        if (estado.nuevoAuto.marca && estado.nuevoAuto.modelo && 
            estado.nuevoAuto.anio && estado.nuevoAuto.fechaIngreso &&
            estado.nuevoAuto.precioCompra && estado.nuevoAuto.dolarBlueCompra && 
            estado.nuevoAuto.fechaPago) {
            
            try {
                setIsSubmitting(true);
                console.log('Iniciando agregado de auto');
                
                const autosRef = ref(database, 'autos');
                const nuevoAutoRef = push(autosRef);
                const nuevoAuto = {
                    ...estado.nuevoAuto,
                    id: nuevoAutoRef.key,
                    gastos: [],
                    timestamp: Date.now()
                };

                await set(nuevoAutoRef, nuevoAuto);
                
                dispatch({ type: 'LIMPIAR_FORMULARIO_AUTO' });
                
                console.log('Auto agregado exitosamente');
            } catch (error) {
                console.error('Error al agregar auto:', error);
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const eliminarAuto = async (id) => {
        try {
            console.log('Iniciando eliminación de auto:', id);
            await remove(ref(database, `autos/${id}`));
            console.log('Auto eliminado exitosamente');
            dispatch({ type: 'ELIMINAR_AUTO', payload: id });
        } catch (error) {
            console.error('Error al eliminar auto:', error);
        }
    };

    const editarAuto = (auto) => {
        console.log('Iniciando edición de auto:', auto);
        dispatch({ type: 'EDITAR_AUTO', payload: auto });
        setIsEditDialogOpen(true)
    };

    const guardarEdicionAuto = async (autoEditado) => {
        if (!autoEditado) {
            console.log('No hay auto en edición');
            return;
        }

        try {
            setIsSubmitting(true);
            console.log('Guardando edición de auto:', autoEditado);
            const autoRef = ref(database, `autos/${autoEditado.id}`);
            await update(autoRef, autoEditado);
            console.log('Auto actualizado en Firebase');
        
            dispatch({ type: 'GUARDAR_EDICION_AUTO', payload: autoEditado });
            console.log('Estado local actualizado');
        
            setIsEditing(false);
            console.log('Modo de edición desactivado, isEditing:', false);
        } catch (error) {
            console.error('Error al guardar la edición del auto:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const cancelarEdicionAuto = () => {
        console.log('Cancelando edición');
        dispatch({ type: 'CANCELAR_EDICION_AUTO' });
        setIsEditing(false);
    };

    const agregarGasto = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
    
        if (!estado.nuevoGasto.descripcion || !estado.nuevoGasto.monto || 
            !estado.nuevoGasto.fecha || !estado.nuevoGasto.dolarBlue || 
            !estado.nuevoGasto.autoId) {
            console.log('Faltan campos requeridos');
            return;
        }
    
        try {
            setIsSubmitting(true);
            console.log('Iniciando agregado de gasto');
            
            const gastoRef = push(ref(database, `autos/${estado.nuevoGasto.autoId}/gastos`));
            const nuevoGasto = { 
                ...estado.nuevoGasto, 
                id: gastoRef.key,
                timestamp: Date.now() // Agregamos timestamp para mejor control
            };
    
            await set(gastoRef, nuevoGasto);
            
            // No necesitamos dispatch aquí porque el listener de Firebase 
            // actualizará automáticamente el estado
            
            dispatch({ type: 'LIMPIAR_FORMULARIO_GASTO' });
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            
            console.log('Gasto agregado exitosamente');
        } catch (error) {
            console.error('Error al agregar gasto:', error);
        } finally {
            setIsSubmitting(false);
        }
    };



    const eliminarGasto = (autoId, gastoId) => {
        dispatch({ type: 'ELIMINAR_GASTO', payload: { autoId, gastoId } });
    }

    const calcularGastoTotal = (gastos, precioCompra) => {
        if (!gastos || typeof gastos !== 'object') {
            return precioCompra;
        }
        
        const gastosArray = Array.isArray(gastos) ? gastos : Object.values(gastos);
        
        const totalGastos = gastosArray.reduce((total, gasto) => {
            return total + (typeof gasto.monto === 'number' ? gasto.monto : 0);
        }, 0);
        
        return totalGastos + precioCompra;
    }

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
            dispatch({ type: 'ACTUALIZAR_NUEVO_GASTO', payload: { fotoTicket: reader.result } });
          }
          reader.readAsDataURL(file);
        }
    }

    const autosFiltrados = estado.autos ? estado.autos.filter(auto => {
        const busqueda = estado.busqueda.toLowerCase();
        const marca = (auto.marca || '').toLowerCase();
        const modelo = (auto.modelo || '').toLowerCase();
        return marca.includes(busqueda) || modelo.includes(busqueda);
    }) : [];

    const datosGrafico = estado.autos ? estado.autos.map(auto => ({
        nombre: `${auto.marca} ${auto.modelo}`,
        gastoTotal: calcularGastoTotal(auto.gastos, auto.precioCompra),
        precioCompra: auto.precioCompra
    })) : [];

    const editarGasto = (autoId, gastoId) => {
        const auto = estado.autos.find(a => a.id === autoId);
        const gasto = auto.gastos.find(g => g.id === gastoId);
        setGastoEnEdicion({ ...gasto, autoId });
        setIsEditGastoDialogOpen(true);
      }
    
      const guardarEdicionGasto = async (gastoEditado) => {
        try {
          setIsSubmitting(true);
          const { autoId, id, ...gastoData } = gastoEditado;
          const gastoRef = ref(database, `autos/${autoId}/gastos/${id}`);
          await update(gastoRef, gastoData);
          
          dispatch({ type: 'GUARDAR_EDICION_GASTO', payload: gastoEditado });
          setIsEditGastoDialogOpen(false);
          setGastoEnEdicion(null);
        } catch (error) {
          console.error('Error al guardar la edición del gasto:', error);
        } finally {
          setIsSubmitting(false);
        }
      }

      const cancelarEdicionGasto = () => {
        setIsEditGastoDialogOpen(false);
        setGastoEnEdicion(null);
      }

    console.log('Renderizando Concesionaria. isEditing:', isEditing);
    console.log('Estado actual:', estado);

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Concesionaria de Autos</h1>

            <Card className="mb-4">
                <CardHeader>
                    <CardTitle>{isEditing ? `Editando Auto: ${estado.autoEnEdicion?.marca} ${estado.autoEnEdicion?.modelo}` : 'Agregar Nuevo Auto'}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <Label htmlFor="marca">Marca</Label>
                            <Input
                                id="marca"
                                value={isEditing ? (estado.autoEnEdicion?.marca || '') : estado.nuevoAuto.marca}
                                onChange={(e) => {
                                    const newValue = e.target.value;
                                    console.log('Cambio en campo marca:', newValue);
                                    console.log('isEditing:', isEditing);
                                    if (isEditing) {
                                        dispatch({ 
                                            type: 'ACTUALIZAR_AUTO_EN_EDICION', 
                                            payload: { marca: newValue } 
                                        });
                                    } else {
                                        dispatch({ 
                                            type: 'ACTUALIZAR_NUEVO_AUTO', 
                                            payload: { marca: newValue } 
                                        });
                                    }
                                }}
                            />
                        </div>
                        <div>
                            <Label htmlFor="modelo">Modelo</Label>
                            <Input
                                id="modelo"
                                value={isEditing ? (estado.autoEnEdicion?.modelo || '') : estado.nuevoAuto.modelo}
                                onChange={(e) => {
                                    const newValue = e.target.value;
                                    if (isEditing) {
                                        dispatch({ 
                                            type: 'ACTUALIZAR_AUTO_EN_EDICION', 
                                            payload: { modelo: newValue } 
                                        });
                                    } else {
                                        dispatch({ 
                                            type: 'ACTUALIZAR_NUEVO_AUTO', 
                                            payload: { modelo: newValue } 
                                        });
                                    }
                                }}
                            />
                        </div>
                        <div>
                            <Label htmlFor="anio">Año</Label>
                            <Input
                                id="anio"
                                type="number"
                                value={isEditing ? (estado.autoEnEdicion?.anio || '') : estado.nuevoAuto.anio}
                                onChange={(e) => {
                                    const newValue = parseInt(e.target.value);
                                    if (isEditing) {
                                        dispatch({ 
                                            type: 'ACTUALIZAR_AUTO_EN_EDICION', 
                                            payload: { anio: newValue } 
                                        });
                                    } else {
                                        dispatch({ 
                                            type: 'ACTUALIZAR_NUEVO_AUTO', 
                                            payload: { anio: newValue } 
                                        });
                                    }
                                }}
                            />
                        </div>
                        <div>
                            <Label htmlFor="fechaIngreso">Fecha de Ingreso</Label>
                            <Input
                                id="fechaIngreso"
                                type="date"
                                value={isEditing ? (estado.autoEnEdicion?.fechaIngreso || '') : estado.nuevoAuto.fechaIngreso}
                                onChange={(e) => {
                                    const newValue = e.target.value;
                                    if (isEditing) {
                                        dispatch({ 
                                            type: 'ACTUALIZAR_AUTO_EN_EDICION', 
                                            payload: { fechaIngreso: newValue } 
                                        });
                                    } else {
                                        dispatch({ 
                                            type: 'ACTUALIZAR_NUEVO_AUTO', 
                                            payload: { fechaIngreso: newValue } 
                                        });
                                    }
                                }}
                            />
                        </div>
                        <div>
                            <Label htmlFor="precioCompra">Precio de Compra</Label>
                            <Input
                                id="precioCompra"
                                type="number"
                                value={isEditing ? (estado.autoEnEdicion?.precioCompra || '') : estado.nuevoAuto.precioCompra}
                                onChange={(e) => {
                                    const newValue = parseFloat(e.target.value);
                                    if (isEditing) {
                                        dispatch({ 
                                            type: 'ACTUALIZAR_AUTO_EN_EDICION', 
                                            payload: { precioCompra: newValue } 
                                        });
                                    } else {
                                        dispatch({ 
                                            type: 'ACTUALIZAR_NUEVO_AUTO', 
                                            payload: { precioCompra: newValue } 
                                        });
                                    }
                                }}
                            />
                        </div>
                        <div>
                            <Label htmlFor="dolarBlueCompra">Dólar Blue en Compra</Label>
                            <Input
                                id="dolarBlueCompra"
                                type="number"
                                value={isEditing ? (estado.autoEnEdicion?.dolarBlueCompra || '') : estado.nuevoAuto.dolarBlueCompra}
                                onChange={(e) => {
                                    const newValue = parseFloat(e.target.value);
                                    if (isEditing) {
                                        dispatch({ 
                                            type: 'ACTUALIZAR_AUTO_EN_EDICION', 
                                            payload: { dolarBlueCompra: newValue } 
                                        });
                                    } else {
                                        dispatch({ 
                                            type: 'ACTUALIZAR_NUEVO_AUTO', 
                                            payload: { dolarBlueCompra: newValue } 
                                        });
                                    }
                                }}
                            />
                        </div>
                        <div>
                            <Label htmlFor="fechaPago">Fecha de Pago</Label>
                            <Input
                                id="fechaPago"
                                type="date"
                                value={isEditing ? (estado.autoEnEdicion?.fechaPago || '') : estado.nuevoAuto.fechaPago}
                                onChange={(e) => {
                                    const newValue  = e.target.value;
                                    if (isEditing) {
                                        dispatch({ 
                                            type: 'ACTUALIZAR_AUTO_EN_EDICION', 
                                            payload: { fechaPago: newValue } 
                                        });
                                    } else {
                                        dispatch({ 
                                            type: 'ACTUALIZAR_NUEVO_AUTO', 
                                            payload: { fechaPago: newValue } 
                                        });
                                    }
                                }}
                            />
                        </div>
                        <div>
                            <Label htmlFor="kilometraje">Kilometraje</Label>
                            <Input
                                id="kilometraje"
                                type="number"
                                value={isEditing ? (estado.autoEnEdicion?.kilometraje || '') : estado.nuevoAuto.kilometraje}
                                onChange={(e) => {
                                    const newValue = parseInt(e.target.value);
                                    if (isEditing) {
                                        dispatch({ 
                                            type: 'ACTUALIZAR_AUTO_EN_EDICION', 
                                            payload: { kilometraje: newValue } 
                                        });
                                    } else {
                                        dispatch({ 
                                            type: 'ACTUALIZAR_NUEVO_AUTO', 
                                            payload: { kilometraje: newValue } 
                                        });
                                    }
                                }}
                            />
                        </div>
                        <div>
                            <Label htmlFor="estado">Estado</Label>
                            <select
                                id="estado"
                                className="w-full border rounded p-2"
                                value={isEditing ? (estado.autoEnEdicion?.estado || '') : estado.nuevoAuto.estado}
                                onChange={(e) => {
                                    const newValue = e.target.value;
                                    if (isEditing) {
                                        dispatch({ 
                                            type: 'ACTUALIZAR_AUTO_EN_EDICION', 
                                            payload: { estado: newValue } 
                                        });
                                    } else {
                                        dispatch({ 
                                            type: 'ACTUALIZAR_NUEVO_AUTO', 
                                            payload: { estado: newValue } 
                                        });
                                    }
                                }}
                            >
                                <option value="Disponible">Disponible</option>
                                <option value="Vendido">Vendido</option>
                                <option value="En reparación">En reparación</option>
                            </select>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    {isEditing ? (
                        <>
                            <Button onClick={guardarEdicionAuto} disabled={isSubmitting}>
                                {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                            </Button>
                            <Button onClick={cancelarEdicionAuto} variant="outline" className="ml-2">
                                Cancelar
                            </Button>
                        </>
                    ) : (
                        <Button onClick={agregarAuto} disabled={isSubmitting}>
                            {isSubmitting ? 'Agregando...' : 'Agregar Auto'}
                        </Button>
                    )}
                </CardFooter>
            </Card>

            <Card className="mb-4">
            <CardHeader>
            <CardTitle>Agregar Gasto</CardTitle>
            </CardHeader>
            <CardContent>
        <form onSubmit={agregarGasto}> {/* Solo mantenemos el onSubmit aquí */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        <div>
                            <Label htmlFor="autoId">Auto</Label>
                            <select
                                id="autoId"
                                className="w-full border rounded p-2"
                                value={estado.nuevoGasto.autoId}
                                onChange={(e) => dispatch({ type: 'ACTUALIZAR_NUEVO_GASTO', payload: { autoId: e.target.value } })}
                            >
                                <option value="">Seleccionar auto</option>
                                {estado.autos.map((auto) => (
                                    <option key={auto.id} value={auto.id}>
                                        {auto.marca} {auto.modelo} ({auto.anio})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <Label htmlFor="descripcion">Descripción</Label>
                            <Input
                                id="descripcion"
                                value={estado.nuevoGasto.descripcion}
                                onChange={(e) => dispatch({ type: 'ACTUALIZAR_NUEVO_GASTO', payload: { descripcion: e.target.value } })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="monto">Monto</Label>
                            <Input
                                id="monto"
                                type="number"
                                value={estado.nuevoGasto.monto}
                                onChange={(e) => dispatch({ type: 'ACTUALIZAR_NUEVO_GASTO', payload: { monto: parseFloat(e.target.value) } })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="fecha">Fecha del Gasto</Label>
                            <Input
                                id="fecha"
                                type="date"
                                value={estado.nuevoGasto.fecha}
                                onChange={(e) => dispatch({ type: 'ACTUALIZAR_NUEVO_GASTO', payload: { fecha: e.target.value } })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="dolarBlue">Valor Dólar Blue</Label>
                            <Input
                                id="dolarBlue"
                                type="number"
                                value={estado.nuevoGasto.dolarBlue}
                                onChange={(e) => dispatch({ type: 'ACTUALIZAR_NUEVO_GASTO', payload: { dolarBlue: parseFloat(e.target.value) } })}
                            />
                        </div>
                        <div>
                            
                            <Label htmlFor="fotoTicket">Foto del Ticket</Label>
                            <Input
                                id="fotoTicket"
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                            />
                        </div>
                        </div>
                        <br></br>
                            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Agregando...' : 'Agregar Gasto'}
                </Button>
                
                </form>
                </CardContent>
                </Card>

            <div className="mb-4">
                <Label htmlFor="busqueda">Buscar Auto</Label>
                <Input
                    id="busqueda"
                    value={estado.busqueda}
                    onChange={(e) => dispatch({ type: 'ACTUALIZAR_BUSQUEDA', payload: e.target.value })}
                    placeholder="Buscar por marca o modelo"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {autosFiltrados.map((auto) => (
                        <Card key={auto.id} className="relative">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <CardTitle>{auto.marca} {auto.modelo}</CardTitle>
                                <div className="flex space-x-2">
                                    <Button variant="ghost" size="icon" onClick={() => editarAuto(auto)}>
                                        <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Esta acción no se puede deshacer. ¿Estás seguro de que quieres eliminar este auto?
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => eliminarAuto(auto.id)}>
                                                    Eliminar
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </div>
                            <CardDescription>
                                Año: {auto.anio} - Ingreso: {auto.fechaIngreso}
                                <br />
                                Precio de Compra: ${auto.precioCompra} - Dólar Blue: ${auto.dolarBlueCompra}
                                <br />
                                Fecha de Pago: {auto.fechaPago}
                                <br />
                                Kilometraje: {auto.kilometraje} km - Estado: {auto.estado}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
              <h3 className="font-bold mb-2">Gastos</h3>
              <ul className="list-none pl-0">
                {(auto.gastos || []).map((gasto) => (
                  <li key={gasto.id} className="flex justify-between items-center py-1 border-b last:border-b-0">
                    <span className="text-red-500">
                      {gasto.descripcion}: ${gasto.monto} - {gasto.fecha}
                    </span>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => editarGasto(auto.id, gasto.id)}>
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MinusCircle className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. ¿Estás seguro de que quieres eliminar este gasto?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => eliminarGasto(auto.id, gasto.id)}>
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
                        <CardFooter className="flex flex-col items-start w-full">
                            <div className="flex items-center space-x-2 w-full mb-2">
                                <Input
                                    type="number"
                                    placeholder="Precio de venta"
                                    value={estado.preciosVenta[auto.id] || ''}
                                    onChange={(e) => dispatch({ type: 'ACTUALIZAR_PRECIO_VENTA', payload: { autoId: auto.id, precio: e.target.value } })}
                                    className="w-32"
                                />
                                <span className="text-sm text-muted-foreground">Calculadora de ganancias</span>
                            </div>
                            <p className="font-bold text-red-500 mb-2">
                                Gastos Totales + Precio de Compra: ${calcularGastoTotal(auto.gastos, auto.precioCompra)}
                            </p>
                            <p className="text-blue-500">
                                Ganancias potenciales: 
                                <span className={`font-bold ${
                                    estado.preciosVenta[auto.id] && parseFloat(estado.preciosVenta[auto.id]) > calcularGastoTotal(auto.gastos, auto.precioCompra)
                                        ? 'text-green-500'
                                        : 'text-red-500'
                                }`}>
                                    ${estado.preciosVenta[auto.id] 
                                        ? (parseFloat(estado.preciosVenta[auto.id]) - calcularGastoTotal(auto.gastos, auto.precioCompra)).toFixed(2)
                                        : '0'}
                                </span>
                            </p>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            <Card className="mt-8">
                <CardHeader>
                    <CardTitle>Gráfico de Gastos por Auto</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={datosGrafico}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="nombre" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="gastoTotal" fill="#FF0000" name="Gasto Total" />
                            <Bar dataKey="precioCompra" fill="#00FF00" name="Precio de Compra" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
            <EditarAuto
              auto={estado.autoEnEdicion}
              isOpen={isEditDialogOpen}
              onSave={(autoEditado) => {
                guardarEdicionAuto(autoEditado)
                setIsEditDialogOpen(false)
              }}
              onCancel={() => {
                cancelarEdicionAuto()
                setIsEditDialogOpen(false)
              }}
            />
                          <EditarGasto
      gasto={gastoEnEdicion}
      isOpen={isEditGastoDialogOpen}
      onSave={guardarEdicionGasto}
      onCancel={() => {
        setIsEditGastoDialogOpen(false);
        setGastoEnEdicion(null);
      }}
    />
        </div>
    )
}