<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSizeChangeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'collection_id' => 'required|exists:collections,id',
            'inventory_id' => 'nullable|exists:inventory,id',
            'original_size_id' => 'required|exists:uniform_sizes,id',
            'new_size_id' => 'required|exists:uniform_sizes,id|different:original_size_id',
            'reason' => 'required|string',
            'notes' => 'nullable|string',
        ];
    }
}
