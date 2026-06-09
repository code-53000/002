<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUniformStyleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'sometimes|string|max:100',
            'code' => 'sometimes|string|max:50|unique:uniform_styles,code,' . $this->uniform_style->id,
            'description' => 'nullable|string',
            'gender' => 'sometimes|in:male,female,unisex',
            'category' => 'sometimes|in:summer,winter,sports,ceremony',
            'original_price' => 'nullable|numeric|min:0',
            'cycle_price' => 'nullable|numeric|min:0',
            'is_active' => 'boolean',
        ];
    }
}
