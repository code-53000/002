<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AddCleaningItemsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'collection_ids' => 'required|array|min:1',
            'collection_ids.*' => 'exists:collections,id',
        ];
    }
}
