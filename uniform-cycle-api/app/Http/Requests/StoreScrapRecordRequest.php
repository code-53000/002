<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreScrapRecordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'collection_id' => 'nullable|exists:collections,id',
            'inventory_id' => 'nullable|exists:inventory,id',
            'reason' => 'required|string',
            'disposal_method' => 'required|in:destroyed,recycled,donated,other',
            'notes' => 'nullable|string',
        ];
    }
}
