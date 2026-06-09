<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreUniformSizeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'size_label' => 'required|string|max:20',
            'size_group' => 'required|string|max:20|in:child,adult',
            'sort_order' => 'integer|min:0',
            'description' => 'nullable|string',
            'height_min' => 'nullable|integer|min:0',
            'height_max' => 'nullable|integer|min:0',
            'is_active' => 'boolean',
        ];
    }
}
