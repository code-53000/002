<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUniformStyleRequest;
use App\Http\Requests\UpdateUniformStyleRequest;
use App\Models\UniformStyle;
use Illuminate\Http\Request;

class UniformStyleController extends Controller
{
    public function index(Request $request)
    {
        $query = UniformStyle::with('createdBy');

        if ($request->has('active')) {
            $query->active();
        }

        if ($request->has('gender')) {
            $query->byGender($request->gender);
        }

        if ($request->has('category')) {
            $query->byCategory($request->category);
        }

        $styles = $query->orderBy('name', 'asc')->paginate($request->per_page ?? 15);

        return response()->json($styles);
    }

    public function store(StoreUniformStyleRequest $request)
    {
        $style = UniformStyle::create([
            ...$request->validated(),
            'created_by' => auth()->id(),
        ]);

        return response()->json([
            'message' => 'Style created successfully',
            'style' => $style->load('createdBy'),
        ], 201);
    }

    public function show(UniformStyle $uniformStyle)
    {
        return response()->json([
            'style' => $uniformStyle->load('createdBy', 'collections', 'inventory'),
        ]);
    }

    public function update(UpdateUniformStyleRequest $request, UniformStyle $uniformStyle)
    {
        $uniformStyle->update($request->validated());

        return response()->json([
            'message' => 'Style updated successfully',
            'style' => $uniformStyle->load('createdBy'),
        ]);
    }

    public function destroy(UniformStyle $uniformStyle)
    {
        $uniformStyle->delete();

        return response()->json([
            'message' => 'Style deleted successfully',
        ]);
    }
}
