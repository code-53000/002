<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCollectionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'style_id' => 'required|exists:uniform_styles,id',
            'size_id' => 'required|exists:uniform_sizes,id',
            'gender' => 'required|in:male,female,unisex',
            'condition' => 'required|in:new,good,fair,poor',
            'defects' => 'nullable|string',
            'source_grade' => 'nullable|string|max:20',
            'source_class' => 'nullable|string|max:20',
            'donor_name' => 'nullable|string|max:50',
            'donor_contact' => 'nullable|string|max:20',
            'collected_at' => 'required|date',
            'notes' => 'nullable|string',
        ];
    }
}
