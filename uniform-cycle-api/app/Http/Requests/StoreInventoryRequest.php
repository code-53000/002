<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreInventoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'collection_id' => 'required|exists:collections,id',
            'cleaning_batch_id' => 'required|exists:cleaning_batches,id',
            'style_id' => 'required|exists:uniform_styles,id',
            'size_id' => 'required|exists:uniform_sizes,id',
            'gender' => 'required|in:male,female,unisex',
            'location' => 'nullable|string|max:50',
            'shelf' => 'nullable|string|max:20',
            'qr_code' => 'nullable|string|max:100',
            'stocked_at' => 'required|date',
            'notes' => 'nullable|string',
        ];
    }
}
