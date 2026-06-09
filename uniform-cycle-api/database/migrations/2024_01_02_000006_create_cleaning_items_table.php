<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cleaning_items', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('batch_id');
            $table->unsignedBigInteger('collection_id');
            $table->enum('status', ['pending', 'washing', 'drying', 'ironing', 'quality_check', 'completed', 'damaged', 'scrapped'])->default('pending');
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->text('quality_notes')->nullable();
            $table->unsignedBigInteger('checked_by')->nullable();
            $table->timestamp('checked_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('batch_id')->references('id')->on('cleaning_batches')->onDelete('cascade');
            $table->foreign('collection_id')->references('id')->on('collections');
            $table->foreign('checked_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cleaning_items');
    }
};
