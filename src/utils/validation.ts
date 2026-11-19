import { ref } from 'vue';

type Label = string | null | undefined;
const field = (label: Label) => label || 'campo';

export default {
    FormRef: <T = HTMLFormElement>() => ref<T | null>(null),
    required: (value: unknown, label?: Label) => !!value || `El ${field(label)} es obligatorio.`,
    requiredArray: (value: unknown[], label?: Label) => value.length > 0 || `El ${field(label)} es obligatorio.`,
    minLength: (value: unknown, length: number, label?: Label) => !value || String(value).length >= length || `El ${field(label)} debe tener al menos ${length} caracteres.`,
    maxLength: (value: unknown, length: number, label?: Label) => !value || String(value).length <= length || `El ${field(label)} debe tener como máximo ${length} caracteres.`,
    email: (value: unknown, label?: Label) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value)) || `El ${field(label)} debe ser un correo válido.`,
    telephone: (value: unknown, label?: Label) => !value || /^[0-9+\-\s()]+$/.test(String(value)) || `El ${field(label)} debe ser un teléfono válido.`,
    integer: (value: unknown, label?: Label) => !value || Number.isInteger(Number(value)) || `El ${field(label)} debe ser un número entero.`,
    fileExtensionIn: (value: File | File[] | null | undefined, extensions: string[], label?: Label) => {
        if (!value) return true;
        const files = Array.isArray(value) ? value : [value];
        return files.every((file) => extensions.some((extension) => file.name.toLowerCase().endsWith(extension.toLowerCase()))) || `El ${field(label)} debe tener uno de estos formatos: ${extensions.join(', ')}.`;
    }
};
