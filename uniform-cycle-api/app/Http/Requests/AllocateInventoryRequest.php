<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AllocateInventoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'reservation_item_id' => 'required|exists:reservation_items,id',
            'inventory_id' => 'required|exists:inventory,id',
        ];
    }
}
