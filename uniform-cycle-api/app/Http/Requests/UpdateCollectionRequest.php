<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCollectionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'style_id' => 'sometimes|exists:uniform_styles,id',
            'size_id' => 'sometimes|exists:uniform_sizes,id',
            'gender' => 'sometimes|in:male,female,unisex',
            'condition' => 'sometimes|in:new,good,fair,poor',
            'defects' => 'nullable|string',
            'source_grade' => 'nullable|string|max:20',
            'source_class' => 'nullable|string|max:20',
            'donor_name' => 'nullable|string|max:50',
            'donor_contact' => 'nullable|string|max:20',
            'collected_at' => 'sometimes|date',
            'status' => 'sometimes|in:pending_cleaning,in_cleaning,cleaned,in_stock,distributed,scrapped',
            'notes' => 'nullable|string',
        ];
    }
}
