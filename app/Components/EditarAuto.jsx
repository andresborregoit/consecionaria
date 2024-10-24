import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function EditarAuto({ auto, onSave, onCancel, isOpen }) {
  const [autoEditado, setAutoEditado] = useState(auto || {})

  useEffect(() => {
    if (auto) {
      setAutoEditado(auto)
    } else {
      setAutoEditado({})
    }
  }, [auto])

  const handleChange = (e) => {
    const { name, value } = e.target
    setAutoEditado(prev => ({
      ...prev,
      [name]: name === 'anio' || name === 'kilometraje' || name === 'precioCompra' || name === 'dolarBlueCompra'
        ? parseFloat(value)
        : value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(autoEditado)
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => onCancel()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Auto</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Detalles del Auto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="marca">Marca</Label>
                <Input
                  id="marca"
                  name="marca"
                  value={autoEditado.marca || ''}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="modelo">Modelo</Label>
                <Input
                  id="modelo"
                  name="modelo"
                  value={autoEditado.modelo || ''}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="anio">Año</Label>
                <Input
                  id="anio"
                  name="anio"
                  type="number"
                  value={autoEditado.anio || ''}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="fechaIngreso">Fecha de Ingreso</Label>
                <Input
                  id="fechaIngreso"
                  name="fechaIngreso"
                  type="date"
                  value={autoEditado.fechaIngreso || ''}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="precioCompra">Precio de Compra</Label>
                <Input
                  id="precioCompra"
                  name="precioCompra"
                  type="number"
                  value={autoEditado.precioCompra || ''}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="dolarBlueCompra">Dólar Blue en Compra</Label>
                <Input
                  id="dolarBlueCompra"
                  name="dolarBlueCompra"
                  type="number"
                  value={autoEditado.dolarBlueCompra || ''}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="fechaPago">Fecha de Pago</Label>
                <Input
                  id="fechaPago"
                  name="fechaPago"
                  type="date"
                  value={autoEditado.fechaPago || ''}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="kilometraje">Kilometraje</Label>
                <Input
                  id="kilometraje"
                  name="kilometraje"
                  type="number"
                  value={autoEditado.kilometraje || ''}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="estado">Estado</Label>
                <select
                  id="estado"
                  name="estado"
                  className="w-full border rounded p-2"
                  value={autoEditado.estado || ''}
                  onChange={handleChange}
                >
                  <option value="">Seleccionar estado</option>
                  <option value="Disponible">Disponible</option>
                  <option value="Vendido">Vendido</option>
                  <option value="En reparación">En reparación</option>
                </select>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit">Guardar Cambios</Button>
              <Button type="button" variant="outline" onClick={onCancel} className="ml-2">
                Cancelar
              </Button>
            </CardFooter>
          </Card>
        </form>
      </DialogContent>
    </Dialog>
  )
}