'use client'
import { useReducer } from 'react';
import Contexto from './Contexto';
import { concesionariaReducer, estadoInicial } from './ReducerHouse';

export default function UsarContexto({ children }) {
  const [estado, dispatch] = useReducer(concesionariaReducer, estadoInicial);

  return (
    <Contexto.Provider value={{ estado, dispatch }}>
      {children}
    </Contexto.Provider>
  );
}