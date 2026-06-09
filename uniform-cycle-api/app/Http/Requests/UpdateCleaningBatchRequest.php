<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCleaningBatchRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'laundry_partner' => 'sometimes|string|max:100',
            'laundry_contact' => 'nullable|string|max:20',
            'received_at' => 'sometimes|date',
            'washing_method' => 'nullable|string',
            'disinfection_method' => 'nullable|string|max:100',
            'status' => 'sometimes|in:pending,in_progress,completed,cancelled',
            'notes' => 'nullable|string',
        ];
    }
}
