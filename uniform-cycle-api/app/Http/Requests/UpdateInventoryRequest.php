<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateInventoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'location' => 'nullable|string|max:50',
            'shelf' => 'nullable|string|max:20',
            'status' => 'sometimes|in:available,reserved,distributed,returned,scrapped',
            'qr_code' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
        ];
    }
}
