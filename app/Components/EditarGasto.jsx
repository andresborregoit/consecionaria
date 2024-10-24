import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { X, Upload } from 'lucide-react'

export default function EditarGasto({ gasto, onSave, onCancel, isOpen }) {
  const [gastoEditado, setGastoEditado] = useState(gasto || {})
  const [imagenes, setImagenes] = useState(gasto?.imagenes || [])
  const [previewImagenes, setPreviewImagenes] = useState([])

  useEffect(() => {
    if (gasto) {
      setGastoEditado(gasto)
      setImagenes(gasto.imagenes || [])
      setPreviewImagenes(gasto.imagenes || [])
    } else {
      setGastoEditado({})
      setImagenes([])
      setPreviewImagenes([])
    }
  }, [gasto])

  const handleChange = (e) => {
    const { name, value } = e.target
    setGastoEditado(prev => ({
      ...prev,
      [name]: ['monto', 'dolarBlue'].includes(name) ? parseFloat(value) : value
    }))
  }

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    const newImagenes = [...imagenes]
    const newPreviewImagenes = [...previewImagenes]

    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        newImagenes.push(file)
        newPreviewImagenes.push(reader.result)
        setImagenes(newImagenes)
        setPreviewImagenes(newPreviewImagenes)
      }
      reader.readAsDataURL(file)
    })
  }

  const handleDeleteImage = (index) => {
    const newImagenes = imagenes.filter((_, i) => i !== index)
    const newPreviewImagenes = previewImagenes.filter((_, i) => i !== index)
    setImagenes(newImagenes)
    setPreviewImagenes(newPreviewImagenes)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({ ...gastoEditado, imagenes })
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => onCancel()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Gasto</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Detalles del Gasto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="descripcion">Descripción</Label>
                <Input
                  id="descripcion"
                  name="descripcion"
                  value={gastoEditado.descripcion || ''}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="monto">Monto</Label>
                <Input
                  id="monto"
                  name="monto"
                  type="number"
                  value={gastoEditado.monto || ''}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="fecha">Fecha del Gasto</Label>
                <Input
                  id="fecha"
                  name="fecha"
                  type="date"
                  value={gastoEditado.fecha || ''}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="dolarBlue">Valor Dólar Blue</Label>
                <Input
                  id="dolarBlue"
                  name="dolarBlue"
                  type="number"
                  value={gastoEditado.dolarBlue || ''}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="imagenes">Imágenes</Label>
                <div className="flex flex-wrap gap-2">
                  {previewImagenes.map((imagen, index) => (
                    <div key={index} className="relative">
                      <img src={imagen} alt={`Gasto ${index + 1}`} className="w-24 h-24 object-cover rounded" />
                      <button
                        type="button"
                        onClick={() => handleDeleteImage(index)}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                  <label htmlFor="upload-images" className="w-24 h-24 flex items-center justify-center border-2 border-dashed border-gray-300 rounded cursor-pointer">
                    <input
                      id="upload-images"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Upload size={24} className="text-gray-400" />
                  </label>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button type="submit">Guardar Cambios</Button>
            </CardFooter>
          </Card>
        </form>
      </DialogContent>
    </Dialog>
  )
}