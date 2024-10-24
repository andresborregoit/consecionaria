import { ref, push, set, remove, update } from 'firebase/database';
import { database } from '../../app/firebase';

export const estadoInicial = {
    autos: [],
    nuevoAuto: {
        marca: '', modelo: '', anio: 0, fechaIngreso: '',
        precioCompra: 0, dolarBlueCompra: 0, fechaPago: '',
        kilometraje: 0, estado: 'Disponible'
    },
    nuevoGasto: {
        descripcion: '', monto: 0, fecha: '', dolarBlue: 0, autoId: '', fotoTicket: null
    },
    autoEnEdicion: null,
    gastoEnEdicion: null,
    busqueda: '',
    preciosVenta: {}
};

// Definición de tipos de acciones
const AGREGAR_AUTO = "AGREGAR_AUTO"
const ACTUALIZAR_NUEVO_AUTO = "ACTUALIZAR_NUEVO_AUTO"
const AGREGAR_GASTO = "AGREGAR_GASTO"
const ACTUALIZAR_NUEVO_GASTO = "ACTUALIZAR_NUEVO_GASTO"
const EDITAR_AUTO = "EDITAR_AUTO"
const ACTUALIZAR_AUTO_EN_EDICION = "ACTUALIZAR_AUTO_EN_EDICION"
const GUARDAR_EDICION_AUTO = "GUARDAR_EDICION_AUTO"
const CANCELAR_EDICION_AUTO = "CANCELAR_EDICION_AUTO"
const ELIMINAR_AUTO = "ELIMINAR_AUTO"
const EDITAR_GASTO = "EDITAR_GASTO"
const ACTUALIZAR_GASTO_EN_EDICION = "ACTUALIZAR_GASTO_EN_EDICION"
const GUARDAR_EDICION_GASTO = "GUARDAR_EDICION_GASTO"
const ELIMINAR_GASTO = "ELIMINAR_GASTO"
const ACTUALIZAR_BUSQUEDA = "ACTUALIZAR_BUSQUEDA"
const ACTUALIZAR_PRECIO_VENTA = "ACTUALIZAR_PRECIO_VENTA"
const CARGAR_AUTOS = "CARGAR_AUTOS"
const CARGAR_AUTOS_SILENCIOSO = "CARGAR_AUTOS_SILENCIOSO"
const LIMPIAR_FORMULARIO_AUTO = "LIMPIAR_FORMULARIO_AUTO"
const LIMPIAR_FORMULARIO_GASTO = "LIMPIAR_FORMULARIO_GASTO"

export function concesionariaReducer(state, action) {
    switch (action.type) {
        case ACTUALIZAR_NUEVO_AUTO:
            return { ...state, nuevoAuto: { ...state.nuevoAuto, ...action.payload } };
            case AGREGAR_GASTO:
                const { autoId, gasto } = action.payload;
                return {
                  ...state,
                  autos: state.autos.map(auto => 
                    auto.id === autoId 
                      ? { 
                          ...auto, 
                          gastos: [...(auto.gastos || []), gasto]
                        }
                      : auto
                  )
                };
        case ACTUALIZAR_NUEVO_GASTO:
            return { ...state, nuevoGasto: { ...state.nuevoGasto, ...action.payload } };
        case ELIMINAR_AUTO:
            return {
                ...state,
                autos: state.autos.filter(auto => auto.id !== action.payload)
            };
        case EDITAR_GASTO:
            const { autoId: editAutoId, gastoId } = action.payload;
            const autoToEdit = state.autos.find(auto => auto.id === editAutoId);
            const gastoToEdit = autoToEdit?.gastos?.find(gasto => gasto.id === gastoId);
            return { 
                ...state, 
                gastoEnEdicion: gastoToEdit ? { ...gastoToEdit, autoId: editAutoId } : null
            };
        case ACTUALIZAR_GASTO_EN_EDICION:
            return { 
                ...state, 
                gastoEnEdicion: { ...state.gastoEnEdicion, ...action.payload }
            };
            case GUARDAR_EDICION_GASTO:
      const gastoEditado = action.payload;
      return {
        ...state,
        autos: state.autos.map(auto => 
          auto.id === gastoEditado.autoId
            ? {
                ...auto,
                gastos: auto.gastos.map(gasto =>
                  gasto.id === gastoEditado.id ? { ...gasto, ...gastoEditado } : gasto
                )
              }
            : auto
        ),
        gastoEnEdicion: null
      };

        case ELIMINAR_GASTO:
            const { autoId: deleteAutoId, gastoId: deleteGastoId } = action.payload;
            remove(ref(database, `autos/${deleteAutoId}/gastos/${deleteGastoId}`));
            const autosActualizadosSinGasto = state.autos.map(auto => {
                if (auto.id === deleteAutoId) {
                    return {
                        ...auto,
                        gastos: auto.gastos.filter(gasto => gasto.id !== deleteGastoId)
                    };
                }
                return auto;
            });
            return {
                ...state,
                autos: autosActualizadosSinGasto
            };
        case ACTUALIZAR_BUSQUEDA:
            return { ...state, busqueda: action.payload };
        case ACTUALIZAR_PRECIO_VENTA:
            return {
                ...state,
                preciosVenta: {
                    ...state.preciosVenta,
                    [action.payload.autoId]: action.payload.precio
                }
            };
        case CARGAR_AUTOS:
            console.log('Cargando autos:', action.payload);
            return { ...state, autos: action.payload };
        case CARGAR_AUTOS_SILENCIOSO:
            console.log('Actualizando estado con autos:', action.payload);
            return {
                ...state,
                autos: action.payload
            };
        case LIMPIAR_FORMULARIO_AUTO:
            return {
                ...state,
                nuevoAuto: estadoInicial.nuevoAuto
            };
        case EDITAR_AUTO:
            console.log('Reducer: Iniciando edición de auto', action.payload);
            return { 
                ...state, 
                autoEnEdicion: { ...action.payload },
                nuevoAuto: { ...action.payload }
            };
        case ACTUALIZAR_AUTO_EN_EDICION:
            console.log('Reducer: Actualizando auto en edición', action.payload);
            return { 
                ...state, 
                autoEnEdicion: { ...state.autoEnEdicion, ...action.payload },
                nuevoAuto: { ...state.nuevoAuto, ...action.payload }
            };
        case GUARDAR_EDICION_AUTO:
            console.log('Reducer: Guardando edición de auto', action.payload);
            const autoActualizado = action.payload;
            const autosActualizados = state.autos.map(auto => 
                auto.id === autoActualizado.id ? autoActualizado : auto
            );
            return {
                ...state,
                autos: autosActualizados,
                autoEnEdicion: null,
                nuevoAuto: estadoInicial.nuevoAuto
            };
        case CANCELAR_EDICION_AUTO:
            console.log('Reducer: Cancelando edición de auto');
            return { 
                ...state, 
                autoEnEdicion: null,
                nuevoAuto: estadoInicial.nuevoAuto
            };
            case LIMPIAR_FORMULARIO_GASTO:
            return {
                ...state,
                nuevoGasto: estadoInicial.nuevoGasto
            };
            case ACTUALIZAR_NUEVO_GASTO:
            return {
                ...state,
                nuevoGasto: { ...state.nuevoGasto, ...action.payload }
            };
            
        default:
            return state;
    }
}