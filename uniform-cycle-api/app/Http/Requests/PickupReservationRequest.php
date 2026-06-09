<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PickupReservationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'picked_up_at' => 'nullable|date',
            'item_ids' => 'nullable|array',
            'item_ids.*' => 'exists:reservation_items,id',
        ];
    }
}
