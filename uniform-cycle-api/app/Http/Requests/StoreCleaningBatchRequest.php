<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCleaningBatchRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'laundry_partner' => 'required|string|max:100',
            'laundry_contact' => 'nullable|string|max:20',
            'received_at' => 'required|date',
            'washing_method' => 'nullable|string',
            'disinfection_method' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
            'collection_ids' => 'nullable|array',
            'collection_ids.*' => 'exists:collections,id',
        ];
    }
}
