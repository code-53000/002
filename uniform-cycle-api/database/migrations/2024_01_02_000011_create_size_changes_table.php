<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('size_changes', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('collection_id');
            $table->unsignedBigInteger('inventory_id')->nullable();
            $table->unsignedBigInteger('original_size_id');
            $table->unsignedBigInteger('new_size_id');
            $table->text('reason');
            $table->unsignedBigInteger('performed_by');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('collection_id')->references('id')->on('collections');
            $table->foreign('inventory_id')->references('id')->on('inventory')->onDelete('set null');
            $table->foreign('original_size_id')->references('id')->on('uniform_sizes');
            $table->foreign('new_size_id')->references('id')->on('uniform_sizes');
            $table->foreign('performed_by')->references('id')->on('users');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('size_changes');
    }
};
