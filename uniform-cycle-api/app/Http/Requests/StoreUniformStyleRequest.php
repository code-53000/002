<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreUniformStyleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:100',
            'code' => 'required|string|max:50|unique:uniform_styles,code',
            'description' => 'nullable|string',
            'gender' => 'required|in:male,female,unisex',
            'category' => 'required|in:summer,winter,sports,ceremony',
            'original_price' => 'nullable|numeric|min:0',
            'cycle_price' => 'nullable|numeric|min:0',
            'is_active' => 'boolean',
        ];
    }
}
