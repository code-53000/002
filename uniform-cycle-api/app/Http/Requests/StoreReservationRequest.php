<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreReservationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'parent_name' => 'required|string|max:50',
            'parent_phone' => 'required|string|max:20',
            'child_name' => 'required|string|max:50',
            'child_grade' => 'required|string|max:20',
            'child_class' => 'nullable|string|max:20',
            'reserved_at' => 'required|date',
            'expires_at' => 'nullable|date|after:reserved_at',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.style_id' => 'required|exists:uniform_styles,id',
            'items.*.size_id' => 'required|exists:uniform_sizes,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.notes' => 'nullable|string',
        ];
    }
}
