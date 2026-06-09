<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StockInRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'cleaning_item_ids' => 'required|array|min:1',
            'cleaning_item_ids.*' => 'exists:cleaning_items,id',
            'location' => 'nullable|string|max:50',
            'shelf' => 'nullable|string|max:20',
            'stocked_at' => 'nullable|date',
        ];
    }
}
