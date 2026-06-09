<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('scrap_records', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('collection_id')->nullable();
            $table->unsignedBigInteger('inventory_id')->nullable();
            $table->text('reason');
            $table->enum('disposal_method', ['destroyed', 'recycled', 'donated', 'other'])->default('destroyed');
            $table->unsignedBigInteger('approved_by');
            $table->unsignedBigInteger('performed_by');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('collection_id')->references('id')->on('collections')->onDelete('set null');
            $table->foreign('inventory_id')->references('id')->on('inventory')->onDelete('set null');
            $table->foreign('approved_by')->references('id')->on('users');
            $table->foreign('performed_by')->references('id')->on('users');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('scrap_records');
    }
};
