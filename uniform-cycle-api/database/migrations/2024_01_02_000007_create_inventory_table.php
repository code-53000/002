<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventory', function (Blueprint $table) {
            $table->id();
            $table->string('sku', 50)->unique();
            $table->unsignedBigInteger('collection_id');
            $table->unsignedBigInteger('cleaning_batch_id');
            $table->unsignedBigInteger('style_id');
            $table->unsignedBigInteger('size_id');
            $table->enum('gender', ['male', 'female', 'unisex'])->default('unisex');
            $table->string('location', 50)->nullable();
            $table->string('shelf', 20)->nullable();
            $table->enum('status', ['available', 'reserved', 'distributed', 'returned', 'scrapped'])->default('available');
            $table->string('qr_code', 100)->nullable();
            $table->unsignedBigInteger('stocked_by');
            $table->timestamp('stocked_at');
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('collection_id')->references('id')->on('collections');
            $table->foreign('cleaning_batch_id')->references('id')->on('cleaning_batches');
            $table->foreign('style_id')->references('id')->on('uniform_styles');
            $table->foreign('size_id')->references('id')->on('uniform_sizes');
            $table->foreign('stocked_by')->references('id')->on('users');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory');
    }
};
