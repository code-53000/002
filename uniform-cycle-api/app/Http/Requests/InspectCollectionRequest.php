<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class InspectCollectionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'condition' => 'required|in:new,good,fair,poor',
            'defects' => 'nullable|string',
            'inspection_notes' => 'required|string',
            'pass' => 'required|boolean',
        ];
    }
}
