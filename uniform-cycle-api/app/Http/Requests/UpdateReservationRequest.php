<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateReservationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'parent_name' => 'sometimes|string|max:50',
            'parent_phone' => 'sometimes|string|max:20',
            'child_name' => 'sometimes|string|max:50',
            'child_grade' => 'sometimes|string|max:20',
            'child_class' => 'nullable|string|max:20',
            'reserved_at' => 'sometimes|date',
            'expires_at' => 'nullable|date|after:reserved_at',
            'notes' => 'nullable|string',
        ];
    }
}
